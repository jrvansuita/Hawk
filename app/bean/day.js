module.exports = class Day extends DataAccess {

  constructor(userId, date, type, total, count, points) {
    super();
    this.userId = Num.def(userId);
    this.date = Dat.def(date);
    this.type = Str.def(type);
    this.total = Floa.def(total);
    this.count = Floa.def(count);

    this.points = points ? parseFloat(points.toFixed(2)) : 0;

  }

  static packing(userId, date, sale) {
    var items = parseInt(sale.itemsQuantity);
    var total = parseFloat(sale.totalProdutos);

    var points = ((total/items)/122) * (sale.itemsQuantity * 0.671);

    return new Day(userId, date, 'invoice', sale.totalProdutos, 1, points);
  }

  static picking(userId, date, items, secs) {
    //Removido o calculo usando os secs porque os usuários estavam roubando.
    var points = (items / (secs/items)) * 1.67;
    //var points = items / 22.53;

    return new Day(userId, date, 'picking', items, secs, points);
  }


  static getKey() {
    return ['userId', 'date', 'type'];
  }


  static sync(day, callback){
    Day.upsert(day.getPKQuery(), {
      $inc: {
        count: day.count,
        total: day.total,
        points: day.points
      }
    }, (err, doc) => {
      if (callback){
        callback(err, doc);
      }
    });
  }

  static search(userId, type, callback){
    Day.aggregate([{
      $match: {
        type: type,
        userId: parseInt(userId),
      }
    },{
      $group: {
        _id: {
          type: "$type",
          userId: "$userId"
        },
        sum_count: {
          $sum: "$count"
        },
        sum_total: {
          $sum: "$total"
        },
        sum_points: {
          $sum: "$points"
        },
        sum_neg_points: {
          $sum: {$cond:[{ '$lt': ['$points', 0]}, "$points", 0]},
        }
      }
    }],
    function(err, res) {
      if (callback)
      callback(err, res);
    });
  }
};
