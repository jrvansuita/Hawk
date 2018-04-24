const Day = require('../bean/day.js');
var UsersProvider = require('../provider/UsersProvider.js');

module.exports = class AchievProvider {

  constructor(callback) {
    this.data = {};
    this.callback = callback;
  }

  onFinished() {
    this.callback(this.data);
  }

  load() {
    var _self = this;

    runAggregate("invoice", (err, res) => {
      loadUsers(res);
      _self.data = res;
      _self.onFinished();
    });
  }

};


function runAggregate(type, callback) {
  Day.aggregate([{
      $match: {
        type: "invoice"
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