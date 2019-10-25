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

  static picking(userId, date, sale, itemsQuantity) {
    var items = sale ? parseInt(sale.itemsQuantity) : itemsQuantity;
    var secs = sale ? (new Date().getTime() - sale.begin.getTime()) / 1000 : 0;

    //Removido o calculo usando os secs porque os usuários estavam roubando.
    var points = items / 12.53;
    //var points = (items / (secs/items)) * 1.67;

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


  static byDay(type, from, to, callback){
    Day.aggregate([{
      $match: {
        type: type,
        'date': {
          $gte: from.begin(),
          $lte: to.end()
        }
      }
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
        sum_count: {
          $sum: "$count"
        },
        sum_total: {
          $sum: "$total"
        },
        sum_points: {
          $sum: "$points"
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
