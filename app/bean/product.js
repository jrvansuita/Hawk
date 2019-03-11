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

};
