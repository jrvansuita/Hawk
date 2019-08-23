const EccosysCalls = require('../eccosys/eccosys-calls.js');
const Fix = require('../bean/fix.js');
const Product = require('../bean/product.js');

module.exports = class ProductDiagnostics{
  constructor(){
    this.page = 0;
    this.currentList = [];
    this.productsAnalyzed = 0;
    this.fixesFound = 0;
    this.startTime = new Date();
  }

  _analizeProducts(product, stocks,  callback){
    this.productsAnalyzed++;
    var attrBundle = getProductAttrBundle(product);


    // --- Cascata --- //
    if (isPhotoMissing(product)){
      if (hasStock(product) || hasLocal(product)){
        if (!hasSales(stocks)){
          this._storeFix(product, Fix.enum().NO_PHOTO);
        }
      }else{
        this._storeFix(product, Fix.enum().REGISTERING);
      }
    }

    else if (noLocalHasStock(product)){
      this._storeFix(product, Fix.enum().NO_LOCAL_HAS_STOCK);
    }

    else if (hasLocalNoStock(product, stocks)){
      this._storeFix(product, Fix.enum().HAS_LOCAL_NO_STOCK);
    }

    else if (isSalesMissing(product, stocks)){
      if (isMagentoProblem(product)){
        if (hasStock(product)){
          this._storeFix(product, Fix.enum().MAGENTO_PROBLEM);
        }else{
          this._storeFix(product, Fix.enum().REGISTERING);
        }

      }else if (!isAssociated(product)){
        this._storeFix(product, Fix.enum().ASSOCIATED);
      }else if(!isVisible(product)){
        this._storeFix(product, Fix.enum().NOT_VISIBLE);
      } else{
        this._storeFix(product, Fix.enum().SALE);
      }
    }

    // --- Cascata --- //


    if (isWeightMissing(product)){
      this._storeFix(product, Fix.enum().WEIGHT);
    }

    if (isNcmProblem(product)){
      this._storeFix(product, Fix.enum().NCM);
    }

    if (isCostPriceMissing(product)){
      this._storeFix(product, Fix.enum().COST);
    }

    if (isBrandMissing(attrBundle.names)){
      this._storeFix(product, Fix.enum().BRAND);
    }

    if (isColorMissing(attrBundle.names)){
      this._storeFix(product, Fix.enum().COLOR);
    }

    if (isDepartmentMissing(attrBundle.names)){
      this._storeFix(product, Fix.enum().DEPARTMENT);
    }

    if (isGenderMissing(attrBundle)){
      this._storeFix(product, Fix.enum().GENDER);
    }

    if (this.sendBroadcast){
      this._emitBroadcast();
    }

    callback();
  }

  _storeFix(product, type){
    Fix.put(product, type);
    this.fixesFound++;
  }

  _emitBroadcast(){
    global.io.sockets.emit('product-diagnostics', {
      productsAnalyzed:   this.productsAnalyzed,
      fixesFound : this.fixesFound,
      startTime: this.startTime
    });
  }


  _checkRangeSku(skus, index, callback){
    this._checkSingleSku(skus[index], ()=>{
      index++

      if (skus.length > index){
        this._checkRangeSku(skus, index, callback);
      }else{
        callback();
      }
    });
  }

  _checkSingleSku(sku, callback){

    //Remove all from this sku
    Fix.removeAll({sku: sku}, (err)=>{

      //Capture the eccosys product
      new EccosysCalls()
      .getProduct(sku, (product)=>{

        //Product doesnt exists anymore Or is inactive
        if (product.error || product.situacao == "I"){
          callback();
        }else{
          //Capture feed product
          Product.get(sku , (feedProduct)=>{
            product.feedProduct = feedProduct;

            //Capture stock history
            new EccosysCalls()
            .pageCount(15)
            .page(0)
            .order('DESC')
            .getStockHistory(sku, (stocks)=>{

              //Analyze the product
              this._analizeProducts(product, stocks, ()=>{
                callback();
              });
            });
          });
        }
      });
    });
  }


  _loadCurrentProducts(callback){
    this.index++;

    if (this.currentList.length > this.index){
      var item = this.currentList[this.index];
      var sku = item.codigo;

      if (item.gtin != ''){
        this._checkSingleSku(sku, ()=>{
          this._loadCurrentProducts(callback);
        });
      }else{
        this._loadCurrentProducts(callback);
      }

    }else{
      callback();
    }
  }

  _loadCurrentPage(){
    new EccosysCalls()
    .active()
    .dates(new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date(), 'data')
    .page(this.page)
    .getProducts((items)=>{
      this.currentList = items;
      this.index = -1;

      this._loadCurrentProducts(()=>{
        this._loadCurrentPage();
      });
    });

    this.page++;
  }



  _resyncStoredSkus(brandName, type){
    var handler = (err, docs)=>{

      var skus = [...new Set(docs.map(i=> i.sku))];

      this._checkRangeSku(skus, 0, ()=>{

      });
    };

    if (brandName){
      Fix.findByBrand(brandName, type, handler);
    }else{
      Fix.findAll(handler);
    }
  }

  sync(){
    this.sendBroadcast = true;
    this._loadCurrentPage();
  }

  refresh(byBrandName, type){
    this.sendBroadcast = true;
    this._resyncStoredSkus(byBrandName, type);
  }


  resync(sku, callback){
    this._checkSingleSku(sku, ()=>{
      callback();
    });
  }

};

function getProductAttrBundle(product){
  var result = {
    names: product._Atributos.map((i)=>{return i.descricao}),
    values: product._Atributos.map((i)=>{return i.valor}),
  }

  return result;
}

function isWeightMissing(product){
  //Considerar somente o peso liquido
  return (parseFloat(product.pesoLiq) /* * parseFloat(product.pesoBruto))*/ == 0) && !isPhotoMissing(product);
}

function hasStock(product){
  return product._Estoque.estoqueReal > 0;
}

function hasLocal(product){
  return product.localizacao != '';
}

function noLocalHasStock(product){
  return !hasLocal(product) && hasStock(product);
}

function hasLocalNoStock(product, stocks){
  return hasLocal(product) && !hasStock(product) && !hasSales(stocks);
}

function isMagentoProblem(product){
  return (!product.feedProduct) || (product.feedProduct && product.feedProduct.quantity == 0);
}


function isSalesMissing(product, stocks){
  var isMoreThan25Days = Dat.daysDif(product.dtCriacao, new Date()) > 25;
  return isMoreThan25Days && !hasSales(stocks);
}

function isColorMissing(attrNames){
  return !attrNames.includes('Cor');
}

function isBrandMissing(attrNames){
  return !attrNames.includes('Marca') || !attrNames.includes('Fabricante');
}

function isCostPriceMissing(product){
  return (parseFloat(product.precoCusto) == 0) || (parseFloat(product.precoCusto) > parseFloat(product.preco));
}

function isDepartmentMissing(attrNames){
  return !attrNames.includes('Departamento');
}

function isGenderMissing(attrBundle){
  var index = attrBundle.names.indexOf('Genero');
  var val = attrBundle.values[index];

  return index == -1 || !['Masculino', 'Feminino', 'Unissex', 'Unisex'].includes(val);
}

function isPhotoMissing(product){
  return !product.feedProduct || !product.feedProduct.image;
}

function hasSales(stocks){
  return stocks.some((i)=>{ return parseFloat(i.quantidade) < 0 && (parseInt(i.idOrigem) > 0); });
}


function isNcmProblem(product){
  var regexp = new RegExp("[0-9]{8}", "g");
  return !product.cf || !regexp.test(Num.extract(product.cf));
}

function isVisible(product){
  return product.feedProduct ? product.feedProduct.visible : true;
}

function isAssociated(product){
  return product.feedProduct ? product.feedProduct.associates && product.feedProduct.associates.includes(',') : true;
}
