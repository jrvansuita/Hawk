const EccosysProvider = require('../eccosys/eccosys-provider.js');

const Product = require('../bean/product.js');

module.exports = {
  getStockHistory(sku, callback) {
    if (sku) {
      new EccosysProvider().stockHistory(sku).go((rows) => {
        callback(rows);
      });
    } else {
      callback();
    }
  },

  searchAutoComplete(typing, callback) {
    Product.likeThis(typing, 150, (_err, products) => {
      callback(products);
    });
  },
};
