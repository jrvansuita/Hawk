const Product = require('../bean/product.js');



module.exports = {
  get(sku, callback){
    if (sku){
      sku = sku.split('-')[0];
      Product.findOne(Product.getKeyQuery(sku), (err, product)=>{
        callback(product);
      });
    }else{
      callback();
    }
  },

};
