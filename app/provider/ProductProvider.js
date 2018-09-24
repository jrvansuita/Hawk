const Product = require('../bean/product.js');



module.exports = {
  get(sku, callback){
    Product.findOne(Product.getKeyQuery(sku), (err, product)=>{
      callback(product);
    });
  },

};
