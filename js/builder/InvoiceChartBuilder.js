var InvoicesProvider = require('../provider/InvoicesProvider.js');
var Chart = require('../bean/chart.js');
var Const = require('../const/const.js');

var chart;

module.exports = {

  getLastMonth(callback) {
    var from = Dat.firstDayOfLastMonth();
    var to = Dat.lastDayOfLastMonth();

    InvoicesProvider.get(from, to,
      function(data) {

        chart = new Chart(Const.invoice_last_month, Const.from_to.format(Dat.format(from), Dat.format(to)));

        Object.keys(data).forEach(function(key, index) {
          var dataItem = data[key];

          var item = chart.addItem(Str.short(dataItem.userName, 10), key);
          item.addBar('total', dataItem.total, 1, 'money');
          item.addBar('count', dataItem.count, 0.6, 'int');
        });

        chart.sort('count');

        callback(chart);
      });
  }

};