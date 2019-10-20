const EccosysCalls = require('../eccosys/eccosys-calls.js');
const Product = require('../bean/product.js');


module.exports ={

  get(eanOrSku, father, callback){
    if (Num.isEan(eanOrSku)){
      this.getByEan(eanOrSku, callback);
    }else{
      this.getBySku(eanOrSku, father, callback);
    }
  },

  getByEan(ean, callback){
    new EccosysCalls().getProduct(ean, (eanProduct)=>{
      if (eanProduct.error){
        handleCallback(callback, eanProduct, ean);
      }else{
        this.getBySku(getFatherSku(eanProduct.codigo), true, (product)=>{
          handleCallback(callback, product, ean);
        });
      }
    });
  },

  getBySku(sku, father, callback){
    new EccosysCalls().getProduct(father ? getFatherSku(sku) : sku , (product)=>{
      handleCallback(callback, product, sku);
    });
  },

  getImage(sku, callback){
    if (sku){
      sku = getFatherSku(sku);
      var found = productsDataCache[sku];

      if (found){
        callback(found);
      }else{
        Product.get(sku, (product)=>{
          putAndControlDataCache(sku, product);

          callback(productsDataCache[sku]);
        });
      }
    }else{
      callback();
    }
  },

  getStockHistory(sku, callback){
    if (sku){
      new EccosysCalls().getStockHistory(sku, (rows)=>{
        callback(rows);
      });
    }else{
      callback();
    }
  },

  updateLocal(sku, newLocal, user,  callback) {
    this.getBySku(sku, false, (product)=>{

      newLocal = newLocal.toUpperCase();

      //Reduzir a obs
      var lines = product.obs.split('\n');
      lines = lines.slice(lines.length - 15, lines.length);

      lines = lines.join('\n');


      var body = {
        codigo: product.codigo,
        localizacao: newLocal,
        obs : lines +  "\n" + user.name + " | Desktop | " + newLocal + " | " + Dat.format(new Date()) + '| Localização'
      };


      new EccosysCalls().updateProduct(body, callback);
    });
  },

  updateNCM(sku, newNCM, user, callback) {
    this.getBySku(sku, false, (product)=>{
      newNCM = newNCM.trim();
      var lines = product.obs;

      var body = {
        codigo: product.codigo,
        cf: newNCM,
        obs : lines +  "\n" + user.name + " | Desktop | " + newNCM + " | " + Dat.format(new Date()) + '| NCM'
      };

      new EccosysCalls().updateProduct(body, callback);
    });
  },

  updateStock(sku, stock, user,  callback) {
    stock = parseInt(stock);

    this.getBySku(sku, false, (product)=>{

      var body = {
        codigo: product.codigo,
        quantidade: Math.abs(stock),
        es: stock < 0 ? 'S' : 'E',
        obs : " Desktop - " +  user.name,
        //Manter o mesmo preço
        custoLancamento : product.precoCusto,
        preco: product.preco
      };


      new EccosysCalls().updateProductStock(product.codigo, body, callback);
    });
  },

  updateWeight(sku, weight, user, callback){

    weight = Floa.floa(weight);

    this.getBySku(sku, false, (product)=>{

      var lines = product.obs;

      var body = {
        codigo: product.codigo,
        pesoLiq: Math.abs(weight),
        pesoBruto: Math.abs(weight),
        obs : lines +  "\n" + user.name + " | Desktop | " + Floa.weight(weight) + " | " + Dat.format(new Date()) + '| Peso'
      };

      new EccosysCalls().updateProduct(body, callback);
    });
  },

  searchAutoComplete(typing, callback){
    Product.likeThis(typing, 150, (err, products)=>{
      callback(products);
    });
  }

};


function handleCallback(callback, product, selected){
  product.selected = selected;
  callback(product);
}


function getFatherSku(sku){
  return sku ? sku.split('-')[0] : sku;
}


var productsDataCache = [];

function putAndControlDataCache(sku, product){
  if (product){
    product = product.toObject();
    delete product.__v;
    delete product._id;

    productsDataCache[sku] = product;

    var arr = Object.keys(productsDataCache);
    if (arr.length > 2000){
      arr.slice(2000, arr.length-1).forEach((i)=>{
        delete productsDataCache[i];
      });
    }
  }else{
    productsDataCache[sku] = {};
  }
}
