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

  static likeQuery(value){
    if (!value){
      return {};
    }

    return {
      $or: [
        //{ 'sku': new RegExp(keyValue, "i") },

        { 'sku': {
          "$regex": value,
          "$options": "i"
        }
      },

      { 'name': {
        "$regex": value,
        "$options": "i"
      }
    },

    { 'brand': {
      "$regex": value,
      "$options": "i"
    }
  }
  ]
};
}

static likeThis(keyValue, limit, callback){
  var query = likeQuery(keyValue);

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

static paging(query, page, callback){
  page--;//Convert to index;

  var rowsPerPage = 50;

  Product.aggregate([
    { $match: query },
    {
      $facet: {
        items: [
          { $sort: {"quantity": -1} },
          { $skip: page * rowsPerPage },
          { $limit: rowsPerPage },
        ],
        info: [
          { $group: {
            _id: null,
            count: {
              $sum: 1
            },
            sum_quantity: {
              $sum: "$quantity"
            }
           } },
        ],
      },
    },
  ],function(err, res) {
    if (callback)
    callback(err, res);
  });
}


};
