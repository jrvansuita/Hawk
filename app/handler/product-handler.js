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
    EccosysCalls.getProduct(ean, (eanProduct)=>{
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
    EccosysCalls.getProduct(father ? getFatherSku(sku) : sku , (product)=>{
      handleCallback(callback, product, sku);
    });
  },

  getImage(sku, callback){
    if (sku){
      Product.findOne(Product.getKeyQuery(getFatherSku(sku)), (err, product)=>{
        callback(product);
      });
    }else{
      callback();
    }
  },

  getStockHistory(sku, callback){
    if (sku){
      EccosysCalls.getStockHistory(sku, (rows)=>{
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
      lines = lines.slice(lines.length - 5, lines.length);

      lines = lines.join('\n');


      var body = {
        codigo: product.codigo,
        localizacao: newLocal,
        obs : lines +  "\n" + user.name + " | Desktop | " + newLocal + " | " + Dat.format(new Date())
      };


      EccosysCalls.updateProduct(body, callback);
    });
  },

  updateNCM(sku, newNCM, user, callback) {
    this.getBySku(sku, false, (product)=>{
      newNCM = newNCM.trim();
      var lines = product.obs.split('\n');

      var body = {
        codigo: product.codigo,
        cf: newNCM,
        obs : lines +  "\n" + user.name + " | Desktop | " + newNCM + " | " + Dat.format(new Date())
      };

      EccosysCalls.updateProduct(body, callback);
    });
  },

  updateStock(sku, stock, user,  callback) {
    stock = parseInt(stock);

    this.getBySku(sku, false, (product)=>{

      var body = {
        codigo: product.codigo,
        quantidade: Math.abs(stock),
        es: stock < 0 ? 'S' : 'E',
        obs : " Desktop - " +  user.name
      };


      EccosysCalls.updateProductStock(product.codigo, body, callback);
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
