const Day = require('../bean/day.js');
var UsersProvider = require('../provider/user-provider.js');
var RecordYear = require('../bean/record-year.js');
const User = require('../bean/user.js');

//Possible parameters [sum_count, sum_total, sum_points]
const sum_field = "sum_points";

module.exports = class {

  constructor(type) {
    this.type = type;
  }

  onAddWinnersListener(func){
    this.onAddWinnersFunc = func;
  }

  onResultListener(func){
    this.onResultFunc = func;
  }

  load(onAddWinnersFunc) {
    runAggregate(this.type, (err, res) => {
      loadUsers(res);
      loadEveryMonth(res, this.onAddWinnersFunc, this.onResultFunc);
    });
  }
};


function loadEveryMonth(res, onAddWinnersFunc, onResultFunc){
  var resultData = [];
  var currentYear = new Date().getFullYear();
  var year = currentYear;

  while (year >= currentYear - 1) {
    var month = 11;

    var recordYear = new RecordYear(year);

    while (month >= 0) {

      var arr = res.filter((item) => {
        return item._id.year == year && item._id.month == month + 1;
      }).sort((a, b) => {
        return a[sum_field] - b[sum_field];
      });

      if (arr.length > 0){
        var champ = arr[arr.length - 1];
        var one = arr[arr.length - 2];
        var two = arr[arr.length - 3];
        var three = arr[arr.length - 4];

        var winnersRows = [champ, one, two, three];
      }

      var monthItem = recordYear.addMonthItem(month);

      if (winnersRows) {
        for (winner of winnersRows) {
          onAddWinnersFunc(winner, monthItem);
        }
      }

      month--;
    }

    recordYear.loadRecords();
    resultData.push(recordYear);
    year--;
  }

  onResultFunc(resultData);
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
      },
      sum_points: {
        $sum: "$points"
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
    var u = global._cachedUsers[item._id.userId];

    item.user = u ? User.suppress(u) : {id: item._id.userId} ;
  });
}
