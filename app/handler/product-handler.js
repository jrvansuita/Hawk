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
      this.getBySku(getFatherSku(eanProduct.codigo), true, (product)=>{
        product.selected = ean;
        callback(product);
      });
    });
  },

  getBySku(sku, father, callback){
    EccosysCalls.getProduct(father ? getFatherSku(sku) : sku , (product)=>{
      if (typeof product == 'string'){
        callback({error : product, selected : sku});
      }else{
        product.selected = sku;
        callback(product);
      }
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



function getFatherSku(sku){
  return sku.split('-')[0];
}
