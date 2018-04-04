var InvoicesProvider = require('../provider/InvoicesProvider.js');
var Chart = require('../bean/chart.js');
var Const = require('../const/const.js');

var charts;
var index;

var onFinished;

module.exports = {

  build(callback) {
    onFinished = callback;
    charts = [];
    index = -1;

    charts.push(buildToday);
    charts.push(buildYesterday);
    charts.push(buildCurrentWeek);
    charts.push(buildLastWeek);
    charts.push(buildCurrentMonth);
    charts.push(buildLastMonth);

    callNext();
  }
};

function callNext() {
  index++;

  if (index < charts.length) {
    charts[index]();
  } else {
    onFinished(charts);
  }
}

function buildToday() {
  buildChart(Dat.today(), Dat.today(), Const.invoice_today);
}

function buildYesterday() {
  buildChart(Dat.yesterday(), Dat.yesterday(), Const.invoice_yesterday);
}

function buildCurrentWeek() {
  buildChart(Dat.firstDayCurrentWeek(), Dat.lastDayCurrentWeek(), Const.invoice_current_week);
}

function buildLastWeek() {
  buildChart(Dat.firstDayLastWeek(), Dat.lastDayLastWeek(), Const.invoice_last_week);
}

function buildCurrentMonth() {
  buildChart(Dat.firstDayOfMonth(), Dat.lastDayOfMonth(), Const.invoice_current_month);
}

function buildLastMonth() {
  buildChart(Dat.firstDayOfLastMonth(), Dat.lastDayOfLastMonth(), Const.invoice_last_month);
}


function buildChart(from, to, title) {
  var callBuilder = function(data) {

    chart = new Chart(title, Const.from_to.format(Dat.format(from), Dat.format(to)));

    Object.keys(data).forEach(function(key, index) {
      var dataItem = data[key];

      var item = chart.addItem(Str.first_word(dataItem.userName, 10), key);
      item.addBar('total', dataItem.total, 1, 'money');
      item.addBar('count', dataItem.count, 0.6, 'int');
    });

    chart.sort('total');
    charts.splice(index, 1, chart);

    callNext();
  };

  new InvoicesProvider(callBuilder).get(from, to);
}