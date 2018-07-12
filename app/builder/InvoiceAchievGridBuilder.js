var AchievProvider = require('../provider/AchievProvider.js');
var Day = require('../bean/day.js');


module.exports = class InvoiceAchievGridBuilder {

  init(full, callback) {
    this.full = full;
    this.finalCallback = callback;
    this.data = [];
  }

  build() {
    var _self = this;

    this.provider = new AchievProvider("invoice", Day.invoicePoints);
    this.provider.onAddRowListener(function(row, achievItem){
      achievItem.user = row.user;
      achievItem.addBar('Pedidos', row.sum_count, '14b5a6');
      achievItem.addBar('Pontos', row.sum_points, '1da8b9', true);
      if (_self.full){
        achievItem.addBar('Receita', row.sum_total, '03c184');
      }
    });

    this.provider.onResultListener(function(resultData){
      _self.finalCallback(resultData);
    });

    this.provider.load();
  }

};
