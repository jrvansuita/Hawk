const EccosysProvider = require('../eccosys/eccosys-provider.js');
const Product = require('../bean/product.js');

module.exports = class ProductProvider {
  constructor(user, log) {
    this.user = user;
    this.api = new EccosysProvider(log);
  }

  isEan(ean) {
    return Num.isEan(ean);
  }

  setEan(ean) {
    this.ean = ean;
    return this;
  }

  setSku(sku, father) {
    this.sku = sku;
    this.father = father;
    return this;
  }

  _getQuery() {
    if (this.ean) {
      return this.ean;
    } else if (this.sku) {
      return this.father ? this.sku.split('-')[0] : this.sku;
    }
  }

  _prepare(product, callback) {
    var result = {};

    if (product) {
      if (this?.user?.manufacturer) {
        if (product.Fabricante !== this?.user?.manufacturer) {
          result.error = Const.product_cant_load_by_this_user;
        }
      }
    } else {
      result.error = Const.none_product_found;
    }

    result = { ...result, selected: this.sku, ...product };

    callback(result);
  }

  get(callback) {
    this.api.product(this._getQuery()).go((product) => {
      this._prepare(product, callback);
    });
  }
};
