
module.exports = class SaleStock extends DataAccess {

  constructor(sku, total, cost, quantity, size, manufacturer, brand, category, gender, season) {
    super();
    this.sku = Str.def(sku);
    this.date = Dat.today();
    this.total = Floa.def(total);
    this.cost = Floa.def(cost);
    this.quantity = Num.def(quantity);
    this.size = Str.def(size);
    this.quantity_sizes = {};


    this.manufacturer = Str.def(manufacturer);
    this.brand = Str.def(brand);
    this.category = Str.def(category);
    this.gender = Str.def(gender);
    this.season = Str.def(season);
  }

  static getKey() {
    return ['sku', 'date'];
  }



  static from(item){


    var skuParts = item.codigo.split('-');

    var sku = skuParts[0];
    sku = sku || item.codigo;

    return new SaleStock(
      sku,
      parseFloat(item.valorTotal),
      parseFloat(item.cost),
      Num.def(item.quantidade),
      skuParts[1],
      item.manufacturer,
      item.brand,
      item.category,
      item.gender,
      item.season,
    );
  }

  save(callback){
    var incData = {
      total: this.total,
      cost: this.cost,
      quantity: this.quantity
    }

    if (this.size.length){
      incData["quantity_sizes." + this.size] = this.quantity;
    }


    SaleStock.upsert(this.getPKQuery(), {
      manufacturer: this.manufacturer,
      brand: this.brand,
      category: this.category,
      gender: this.gender,
      season: this.season,

      $inc: incData
    }, (err, doc) => {
      if (callback){
        callback(err, doc);
      }
    });
  }






    static byDay(from, to, callback){
      SaleStock.aggregate([{
        $match: SaleStock.range('date', from, to, true)
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$date"
            },
            month: {
              $month: "$date"
            },
            day: {
              $dayOfMonth: "$date"
            },
          },
          sum_total: {
            $sum: "$total"
          },
          sum_cost: {
            $sum: "$cost"
          },
          sum_quantity: {
            $sum: "$quantity"
          }
        }
      },
      {
        /* sort descending (latest subscriptions first) */
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }],
      function(err, res) {
        if (callback)
        callback(err, res);
      });
    }


};
