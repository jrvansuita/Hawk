module.exports = class Day extends DataAccess {

  constructor(userId, date, type, total, count, points) {
    super();
    this.userId = Num.def(userId);
    this.date = Dat.def(date);
    this.type = Str.def(type);
    this.total = Floa.def(total);
    this.count = Floa.def(count);

    this.points = points || Day.calcPoints(this);
  }

  static calcPoints(day){
    var points = 0;

    if (day.type == 'invoice'){
      points =  ((day.total)/1000) * 2.7;
    }else if (day.type == 'picking'){
      points = ((day.total) / (day.count/day.total)) * 2;
    }

    points = parseFloat(points.toFixed(2));

    return points;
  }


static packing(userId, date, sale) {
  return new Day(userId, date, 'invoice', (parseFloat(sale.totalProdutos)/2) * sale.itemsQuantity, 1);
}

static picking(userId, date, items, secs) {
  return new Day(userId, date, 'picking', items, secs);
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
