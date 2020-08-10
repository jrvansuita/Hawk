const EccosysProvider = require('../eccosys/eccosys-provider.js');

const Product = require('../bean/product.js');
// const MagentoCalls = require('../magento/magento-calls.js');

module.exports = {
  //   get(eanOrSku, father, callback) {
  //     if (Num.isEan(eanOrSku)) {
  //       this.getByEan(eanOrSku, callback);
  //     } else {
  //       this.getBySku(eanOrSku, father, callback);
  //     }
  //   },

  //   getByEan(ean, callback) {
  //     new EccosysProvider().product(ean).go((eanProduct) => {
  //       if (eanProduct) {
  //         this.getSkus(getFatherSku(eanProduct.codigo), true, (data) => {
  //           eanProduct._Skus = data[0]._Skus;
  //           handleCallback(callback, eanProduct, ean);
  //         });
  //       } else {
  //         handleCallback(callback, eanProduct, ean);
  //       }
  //     });
  //   },

  //   getSkus(skus, idOrder, callback) {
  //     new EccosysProvider(false).skus(skus).go((products) => {
  //       idOrder ? callback(this._orderProducts(products)) : callback(products);
  //     });
  //   },

  //   getBySku(sku, father, callback) {
  //     new EccosysProvider(false).product(father ? getFatherSku(sku) : sku).go((product) => {
  //       handleCallback(callback, product, sku);
  //     });
  //   },

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
