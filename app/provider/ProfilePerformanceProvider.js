const UsersProvider = require('../provider/user-provider.js');
const Day = require('../bean/day.js');
const performanceChartBuilder = require('../builder/performance-chart-builder.js');
const IndicatorsBuilder = require('../builder/indicator-builder.js');



module.exports = {

  onUserPerformance(from, to, idUser, isFull, callback){
    var user = UsersProvider.get(idUser);
    performanceChartBuilder.build(from, to, idUser, function(charts) {
       var indicatorsBuilder = new IndicatorsBuilder(idUser, isFull);
       indicatorsBuilder.build((indicators)=>{
        callback(user, charts, indicators);
       });
    });
  }



};
