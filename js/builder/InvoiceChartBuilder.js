var InvoicesProvider = require('../provider/InvoicesProvider.js');
var Chart = require('../bean/chart.js');
var Const = require('../const/const.js');

var chartsBundle;
var chartCount;
var onFinished;

module.exports = {

  build(callback) {
    chartCount = 0;
    onFinished = callback;
    chartsBundle = [];

    this.buildToday();
    this.buildYesterday();
    this.buildCurrentWeek();
    this.buildCurrentMonth();
    this.buildLastMonth();
  },

  buildToday() {
    this.buildChart(Dat.today(), Dat.today(), Const.invoice_today);
  },

  buildYesterday() {
    this.buildChart(Dat.yesterday(), Dat.yesterday(), Const.invoice_yesterday);
  },

  buildCurrentWeek() {
    this.buildChart(Dat.firstDayCurrentWeek(), Dat.lastDayCurrentWeek(), Const.invoice_yesterday);
  },

  buildCurrentMonth() {
    this.buildChart(Dat.firstDayOfMonth(), Dat.lastDayOfMonth(), Const.invoice_current_month);
  },

  buildLastMonth() {
    this.buildChart(Dat.firstDayOfLastMonth(), Dat.lastDayOfLastMonth(), Const.invoice_last_month);
  },

  buildChart(from, to, title) {
    chartCount++;

    InvoicesProvider.get(from, to,
      function(data) {

        chart = new Chart(title, Const.from_to.format(Dat.format(from), Dat.format(to)));

        Object.keys(data).forEach(function(key, index) {
          var dataItem = data[key];

          var item = chart.addItem(Str.short(dataItem.userName, 10), key);
          item.addBar('total', dataItem.total, 1, 'money');
          item.addBar('count', dataItem.count, 0.6, 'int');
        });

        chart.sort('total');

        onCheckFinished(chart);
      });
  }

};

function onCheckFinished(chart) {
  chartsBundle.push(chart);

  if (chartCount === chartsBundle.length) {
    onFinished(chartsBundle);
  }
}