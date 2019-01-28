module.exports = class Product extends DataAccess {

  constructor(sku, name, url, image, price) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.url = Str.def(url);
    this.image = Str.def(image);
    this.sellPrice = Floa.def(price);
  }

  static getKey() {
    return ['sku'];
  }


};
