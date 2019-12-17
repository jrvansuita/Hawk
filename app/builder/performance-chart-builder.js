var Provider = require('../provider/days-provider.js');
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

      var item = chart.addItem(null, dataItem.label, 'none');

      if (type == 'picking'){
        item.addBar('Itens',dataItem.total, 0.8, '03c184', true);
      }

      if (type == 'invoice'){
       item.addBar('Pedidos', dataItem.count, 0.8, '14b5a6', true);
       }

      item.addBar('Pontos', dataItem.points, 1, '1da8b9', true);
    });

    //chart.sort('Pontos');

    charts.push(chart);
    callback();
  };

  new Provider(type, callBuilder).getDaysByUser(from, to, userId);
}
