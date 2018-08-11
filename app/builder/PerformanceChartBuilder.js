var DaysChartProvider = require('../provider/DaysChartProvider.js');
var Chart = require('../bean/chart.js');
var Day = require('../bean/day.js');


var charts;
var onFinished;

function init(callback) {
  onFinished = callback;
  charts = [];
}

module.exports = {

  build(from, to, userId, callback) {
    init(callback);

    //Build Picking
    buildChart('picking','Pontos em Picking por dia', from, to, userId, function(){
      //Build Invoice
      buildChart('invoice', 'Pontos em Packing por dia', from, to, userId, function(){
        callback(charts);
      });
    });
  },
};


function buildChart(type, title, from, to, userId, callback) {
  var callBuilder = function(data) {

    chart = new Chart(title, Dat.print(from, to));

    Object.keys(data).forEach(function(key, index) {
      var dataItem = data[key];

      var item = chart.addItem(dataItem.label, 'none');

      //item.addBar('Itens', dataItem.total, 0.8, '03c184', true);
      //item.addBar('Segundos/Item', dataItem.count/dataItem.total, 0.7, '5f7ce8', false);

      var points = Day[type + 'Points'](dataItem.count, dataItem.total);
      if (points > 0)
      item.addBar('Pontos', points, 1, '1da8b9', true);
    });

    //chart.sort('Pontos');
    charts.push(chart);
    callback();
  };

  new DaysChartProvider(type, callBuilder).getDaysByUser(from, to, userId);
}
