var InvoicesProvider = require('../provider/InvoicesProvider.js');
var Chart = require('../bean/chart.js');


var charts;
var index;
var isfull;
var onFinished;

function init(full, callback) {
  isfull = full;
  onFinished = callback;
  charts = [];
  index = -1;
}

module.exports = {


  buildOverview(full, callback) {
    init(full, callback);

    charts.push(buildToday);
    charts.push(buildYesterday);
    charts.push(buildCurrentWeek);
    charts.push(buildLastWeek);
    charts.push(buildCurrentMonth);
    charts.push(buildLastMonth);

    callNext();
  },

  buildByDate(from, to, full, callback) {
    init(full, callback);

    charts.push(function() {
      buildByDate(from, to);
    });

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

function buildByDate(from, to) {
  buildChart(from, to, Const.invoice_by_date);
}


function buildChart(from, to, title) {
  var callBuilder = function(data) {

    chart = new Chart(title, Dat.print(from, to));

    Object.keys(data).forEach(function(key, index) {
      var dataItem = data[key];

      var item = chart.addItem(Str.first_word(dataItem.userName, 10), key);


      if (isfull)
        item.addBar('Receita', dataItem.total, 1, '03c184', true);

      item.addBar('Pontos', (dataItem.count * dataItem.total) / 1000, isfull ? 0.8 : 1, '1da8b9', !isfull);
      item.addBar('Pedidos', dataItem.count, 0.5, '14b5a6', true);
    });

    chart.sort('Pontos');
    charts.splice(index, 1, chart);

    callNext();
  };

  new InvoicesProvider(callBuilder).get(from, to);
}