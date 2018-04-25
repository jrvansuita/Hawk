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


      var currentYear = new Date().getFullYear();
      var year = currentYear;

      while (year >= currentYear - 1) {
        var month = 11;

        var achiev = new Achiev(year);

        while (month >= 0) {

          var arr = res.filter((item) => {
            return item._id.year == year && item._id.month == month;
          }).sort((a, b) => {
            return a[field] - b[field];
          });

          var row = arr[arr.length - 1];

          var aItem = achiev.addItem(month);

          if (row) {
            aItem.user = row.user;
            aItem.addBar('Pedidos', row.sum_count, '14b5a6');
            aItem.addBar('Pontos', row.sum_points, '1da8b9');
            aItem.addBar('Receita', row.sum_total, '03c184');
          }

          month--;
        }

        _self.data.push(achiev);

        year--;
      }


      _self.finalCallback(_self.data);
    });

    this.provider.load();


  }

};