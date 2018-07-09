const Day = require('../bean/day.js');
var UsersProvider = require('../provider/UsersProvider.js');
var Achiev = require('../bean/achiev.js');

//Possible parameters [sum_count, sum_total, sum_points]
const sum_field = "sum_points";

module.exports = class AchievProvider {

  constructor(type, pointsFunc) {
    this.type = type;
    this.pointsFunc = pointsFunc;
    this.data = {};
  }

  onAddRowListener(func){
    this.onAddRowFunc = func;
  }

  onResultListener(func){
    this.onResultFunc = func;
  }

  load(onAddRowFunc) {
    var _self = this;

    runAggregate(this.type, (err, res) => {
      loadUsers(res);
      _self.data = calcPoints(res, this.pointsFunc);
      loadEveryMonth(_self.data, this.onAddRowFunc, this.onResultFunc);
    });
  }
};


function loadEveryMonth(res, onAddRowFunc, onResultFunc){
  var resultData = [];
  var currentYear = new Date().getFullYear();
  var year = currentYear;

  while (year >= currentYear - 1) {
    var month = 11;

    var achiev = new Achiev(year);

    while (month >= 0) {

      var arr = res.filter((item) => {
        return item._id.year == year && item._id.month == month + 1;
      }).sort((a, b) => {
        return a[sum_field] - b[sum_field];
      });

      var row = arr[arr.length - 1];

      var achievItem = achiev.addItem(month);

      if (row) {
        achievItem = onAddRowFunc(row, achievItem);
      }

      month--;
    }

    resultData.push(achiev);
    year--;
  }

  onResultFunc(resultData);
}


function calcPoints(data, func){
  data.forEach((item) => {
    item.sum_points = func(item.sum_count, item.sum_total);
  });

  return data;
}

function runAggregate(_type, callback) {
  Day.aggregate([{
      $match: {
        type: _type
      }
    }, {
      $group: {
        _id: {
          year: {
            $year: "$date"
          },
          month: {
            $month: "$date"
          },
          userId: "$userId"
        },
        sum_count: {
          $sum: "$count"
        },
        sum_total: {
          $sum: "$total"
        }
      }
    }],
    function(err, res) {
      if (callback)
        callback(err, res);
    });
}

function loadUsers(data) {
  data.forEach((item) => {
    item.user = global.localUsers[item._id.userId];
  });
}
