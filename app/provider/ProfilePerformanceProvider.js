const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');




module.exports = {

  onUserPerformance(from, to, idUser, callback){

    var user = UsersProvider.get(idUser);

    require('../builder/PerformanceChartBuilder.js').build(from, to, idUser, function(charts) {
       callback(user, charts);
    });
  }

};
