var AchievProvider = require('../provider/AchievProvider.js');
var Day = require('../bean/day.js');


module.exports = class PickingAchievGridBuilder {

  init(full, callback) {
    this.full = full;
    this.finalCallback = callback;
    this.data = [];
  }

  build() {
    var _self = this;

    this.provider = new AchievProvider("picking", Day.pickingPoints);

    this.provider.onAddRowListener(function(row, achievItem){
      achievItem.user = row.user;
      achievItem.addBar('Segundos/Item', row.sum_count/row.sum_total, '5f7ce8');
      achievItem.addBar('Pontos', row.sum_points, '1da8b9');
      achievItem.addBar('Itens', row.sum_total, '03c184');
    });

    this.provider.onResultListener(function(resultData){
      _self.finalCallback(resultData);
    });

    this.provider.load();
  }

};
