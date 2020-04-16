
module.exports = class Sale extends DataAccess {

  constructor(sku, url, img, type, approved) {
    super();
    this.sku = Str.def(sku);
    this.date = Dat.now();

    this.total =  Floa.def(total);
    this.cost = Floa.def(cost);
    this.quantity = Num.def(quantity);

    this.tam = Str.def(tam);

    this.manufacturer = Str.def(manufacturer);
    this.brand = Str.def(brand);
    this.category = Str.def(category);
    this.gender = Str.def(gender);
    this.season = Str.def(season);
  }

  static getKey() {
    return ['_id'];
  }



};
