var DaysChartProvider = require('../provider/DaysChartProvider.js');
var Chart = require('../bean/chart.js');
var Day = require('../bean/day.js');


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
  buildChart(Dat.today(), Dat.endToday(), Const.picking_today);
}

function buildYesterday() {
  buildChart(Dat.yesterday(), Dat.yesterday(), Const.picking_yesterday);
}

function buildCurrentWeek() {
  buildChart(Dat.firstDayCurrentWeek(), Dat.lastDayCurrentWeek(), Const.picking_current_week);
}

function buildLastWeek() {
  buildChart(Dat.firstDayLastWeek(), Dat.lastDayLastWeek(), Const.picking_last_week);
}

function buildCurrentMonth() {
  buildChart(Dat.firstDayOfMonth(), Dat.lastDayOfMonth(), Const.picking_current_month);
}

function buildLastMonth() {
  buildChart(Dat.firstDayOfLastMonth(), Dat.lastDayOfLastMonth(), Const.picking_last_month);
}

function buildByDate(from, to) {
  buildChart(from, to, Const.picking_by_date);
}


function buildChart(from, to, title) {
  var callBuilder = function(data) {

    chart = new Chart(title, Dat.print(from, to));

    Object.keys(data).forEach(function(key, index) {
      var dataItem = data[key];

      var item = chart.addItem(Str.first_word(dataItem.userName, 10), dataItem.userImg);

      item.addBar('Itens', dataItem.total, 0.8, '03c184', true);
      //item.addBar('Tempo', dataItem.count, 0.7, '14b5a6', true);

      item.addBar('Segundos/Item', dataItem.count/dataItem.total, 0.7, '5f7ce8', false);

      var points = Day.pickingPoints(dataItem.count, dataItem.total);
      if (points > 0)
      item.addBar('Pontos', points, 1, '1da8b9', false);

    });

    chart.sort('Pontos');
    charts.splice(index, 1, chart);

    callNext();
  };

  new DaysChartProvider('picking', callBuilder).get(from, to);
}
