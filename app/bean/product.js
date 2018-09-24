module.exports = class Product extends DataAccess {

  constructor(sku, name, url, image) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.url = Str.def(url);
    this.image = Str.def(image);
  }

  static getKey() {
    return ['sku'];
  }


};
