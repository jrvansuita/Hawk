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

  get(from, to) {



    Day.aggregate([{
        $match: {
          type: "invoice"
        }
      }, {
        $group: {
          _id: date,
          sum_count: {
            $sum: "$count"
          },
          sum_total: {
            $sum: "$total"
          }
        }
      }],
      function(err, res) {
        if (err); // TODO handle error
        console.log(res);
      });
  });

}
};