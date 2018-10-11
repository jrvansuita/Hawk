const History = require('../bean/history.js');
const Day = require('../bean/day.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports={

  balance(user, data, callback){
    var typeStr = data.type;
    data.type = data.type.toString().toLowerCase();

    if (data.type == 'packing'){
      data.type = 'invoice';
    }

    var val = data.points > 0 ? '+'+ data.points : data.points;
    var userPoints = UsersProvider.get(data.userId);

    History.notify(user.id, 'Balanço de Pontos', 'Acerto manual de pontos:\n' + userPoints.name + '  '  + val + '  ' + typeStr + '\n' + data.obs, 'Pontos');
    Day.sync(new Day(data.userId, Dat.now(), data.type, 0 ,0 , data.points));

    callback();
  }

};
