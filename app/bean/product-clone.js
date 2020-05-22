//backup product.js

module.exports = class Product extends DataAccess {

  constructor(sku, name, brand, url, image, price, fromPrice, cost, discount, category, gender, color, quantity, age, year, season, manufacturer, visble, associates, weight) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.url = Str.def(url);
    this.image = Str.def(image);

    this.price =  Floa.def(price);
    this.fromPrice = Floa.def(fromPrice);
    this.cost = Floa.def(cost);
    this.discount = Floa.def(discount);

    this.brand = Str.def(brand);
    this.category = Str.def(category);
    this.gender = Str.def(gender);
    this.color = Str.def(color);
    this.quantity = Num.def(quantity);


    this.age = Str.def(age);
    this.year = Str.def(year);
    this.season = Str.def(season);
    this.manufacturer = Str.def(manufacturer);
    this.weight = Str.def(weight);

    this.visible = visble ? true : false;
    this.associates = Str.def(associates);

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
  var query = this.likeQuery(keyValue);

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
            },

            sum_cost: {
              $sum: { $multiply: [ "$quantity", "$cost" ] }
            },

            sum_sell: {
              $sum: { $multiply: [ "$quantity", "$price" ] }
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
