const ProductImageProvider = require('../provider/product-image-provider.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = class ProductProvider {
  constructor(user, log) {
    this.user = user;
    this.api = new EccosysProvider(log);
  }

  withImage(loadImage = true) {
    this.loadImage = loadImage;
    return this;
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

  setSkus(skus, order) {
    this.skus = skus;
    this.order = order;
    return this;
  }

  _getQuery() {
    if (this.ean) {
      return this.ean;
    } else if (this.sku) {
      return this.father ? this.sku.split('-')[0] : this.sku;
    }

    return undefined;
  }

  _prepare(product, callback) {
    var result = {};

    if (product) {
      console.log(this?.user?.manufacturer);
      console.log(product.Fabricante);
      if (this?.user?.manufacturer) {
        if (product.Fabricante !== this?.user?.manufacturer) {
          result.error = Const.product_cant_load_by_this_user;
        }
      }
    } else {
      result.error = Const.none_product_found;
    }

    result.selected = this.sku;

    if (!result.error) {
      result = { ...result, ...product };
    }

    callback(result);
  }

  _decodeLetterSizeProduct(size) {
    var sizes = ['RN', 'P', 'M', 'G', 'GG', 'XXG'];
    var index = sizes.indexOf(size);
    return Num.def(index > -1 ? index - 100 : size);
  }

  _order(products) {
    return products.sort((a, b) => {
      return this._decodeLetterSizeProduct(a.codigo.split('-')[1]) - this._decodeLetterSizeProduct(b.codigo.split('-')[1]);
    });
  }

  _checkLoadWithImage(product, callback) {
    if (this.loadImage && !product.error) {
      new ProductImageProvider().getImage(product.codigo, (img) => {
        product.img = img;
        callback(product);
      });
    } else {
      callback(product);
    }
  }

  get(callback) {
    if (this._getQuery()) {
      this.api.product(this._getQuery()).go((product) => {
        this._prepare(product, (product) => {
          this._checkLoadWithImage(product, callback);
        });
      });
    } else {
      this.api.skus(this.skus).go((products) => {
        this.order ? callback(this._order(products)) : callback(products);
      });
    }
  }
};
