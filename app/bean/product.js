module.exports = class Product extends DataAccess {

  constructor(sku, name, brand, url, image, price, category, gender, color, quantity, age, year, season) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.url = Str.def(url);
    this.image = Str.def(image);
    this.sellPrice = Floa.def(price);

    this.brand = Str.def(brand);
    this.category = Str.def(category);
    this.gender = Str.def(gender);
    this.color = Str.def(color);
    this.quantity = Num.def(quantity);

    this.age = Str.def(age);
    this.year = Str.def(year);
    this.season = Str.def(season);
  }

  static getKey() {
    return ['sku'];
  }

  static likeThis(keyValue, limit, callback){
    var query  = {
      $or: [
        //{ 'sku': new RegExp(keyValue, "i") },

        { 'sku': {
          "$regex": keyValue,
          "$options": "i"
        }
      },

      { 'name': {
        "$regex": keyValue,
        "$options": "i"
      }
    }
  ]
};

this.staticAccess()
.find(query)
.limit(limit)
.exec(callback);
}

static get(sku, callback){
  Product.findOne(Product.getKeyQuery(sku.split('-')[0]), (err, product)=>{
    callback(product);
  });
}


};
