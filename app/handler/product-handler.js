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

      var body = {
        codigo: product.codigo,
        localizacao: newLocal,
        obs : product.obs +  "\n" + user.name + ": Localização -> " + newLocal + " em " + Dat.format(new Date())
      };


      EccosysCalls.updateProductLocal(body, callback);
    });
  },

  updateStock(sku, stock, user,  callback) {
    stock = parseInt(stock);

    this.getBySku(sku, false, (product)=>{

      var body = {
        codigo: product.codigo,
        quantidade: Math.abs(stock),
        es: stock < 0 ? 'S' : 'E',
        obs : " - " +  user.name
      };


      EccosysCalls.updateProductStock(product.codigo, body, callback);
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
