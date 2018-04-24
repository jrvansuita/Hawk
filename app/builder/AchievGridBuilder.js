var AchievProvider = require('../provider/AchievProvider.js');
var Achiev = require('../bean/achiev.js');
var Day = require('../bean/day.js');


module.exports = class AchievGridBuilder {

  init(callback) {
    this.finalCallback = callback;
    this.data = [];
  }

  //Possible parameters [sum_count, sum_total, sum_points]
  build(field) {
    field = field || "sum_points";

    var _self = this;

    this.provider = new AchievProvider((res) => {
      res.forEach((item) => {
        item.sum_points = Day.pointsCalc(item.sum_count, item.sum_total);
      });


      var month = 11;
      var year = new Date().getFullYear();

      while (month >= 0) {

        var arr = res.filter((item) => {
          return item._id.year == year && item._id.month == month;
        }).sort((a, b) => {
          return a[field] - b[field];
        });

        var row = arr[arr.length - 1];

        var achiev = new Achiev(month, year);

        if (row) {
          achiev.user = row.user;
          achiev.addBar('Pedidos', row.sum_count, '14b5a6');
          achiev.addBar('Pontos', row.sum_points, '1da8b9');
          achiev.addBar('Receita', row.sum_total, '03c184');
        }

        _self.data.push(achiev);

        month--;
      }

      _self.finalCallback(_self.data);
    });

    this.provider.load();


  }

};