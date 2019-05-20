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
    var attrs = getProductAttrs(product);

    if (isPhotoMissing(product)){
      this._storeFix(product, Fix.enum().PHOTO);
    }

    if (isLocalMissing(product)){
      this._storeFix(product, Fix.enum().LOCAL);
    }

    if (isWeightMissing(product)){
      this._storeFix(product, Fix.enum().WEIGHT);
    }

    if (isSalesMissing(product, stocks)){
      this._storeFix(product, Fix.enum().SALE);
    }

    if (isCostPriceMissing(product)){
      this._storeFix(product, Fix.enum().COST);
    }

    if (isBrandMissing(attrs)){
      this._storeFix(product, Fix.enum().BRAND);
    }

    if (isColorMissing(attrs)){
      this._storeFix(product, Fix.enum().COLOR);
    }

    if (isDepartmentMissing(attrs)){
      this._storeFix(product, Fix.enum().DEPARTMENT);
    }

    if (isGenderMissing(attrs)){
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



  _checkSingleSku(sku, callback){
    //Remove all from this sku
    Fix.removeAll({sku: sku}, (err)=>{

      //Capture the eccosys product
      new EccosysCalls()
      .getProduct(sku, (product)=>{

        //Product doesnt exists anymore
        if (product.error){
          callback();
        }else{    
          //Capture feed product
          Product.get(sku , (feedProduct)=>{
            product.feedProduct = feedProduct;

            //Capture stock history
            new EccosysCalls()
            .pageCount(5)
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

  sync(){
    this.sendBroadcast = true;
    this._loadCurrentPage();
  }


  resync(sku, callback){
    this._checkSingleSku(sku, ()=>{
      callback();
    });
  }

};

function getProductAttrs(product){
  return product._Atributos.map((i)=>{return i.descricao});
}


function isWeightMissing(product){
  return (parseFloat(product.pesoLiq) * parseFloat(product.pesoBruto)) == 0;
}

function isLocalMissing(product){
  return product.localizacao == '' && (product._Estoque.estoqueReal > 0) && !isPhotoMissing(product);
}

function isSalesMissing(product, stocks){
  var isMoreThan10Days = Dat.daysDif(product.dtCriacao, new Date()) > 9;
  var hasSales = stocks.some((i)=>{ return parseFloat(i.quantidade) < 0 && (parseInt(i.idOrigem) > 0); });

  return isMoreThan10Days && !hasSales && !isPhotoMissing(product);
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

function isGenderMissing(attrNames){
  return !attrNames.includes('Genero') || !attrNames.includes('Gênero');
}

function isPhotoMissing(product){
  return !product.feedProduct || !product.feedProduct.image;
}
