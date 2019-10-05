const History = require('../bean/history.js');
const Day = require('../bean/day.js');
const UsersProvider = require('../provider/user-provider.js');

module.exports={

  balance(user, data, callback){
    var typeStr = data.type;
    data.type = data.type.toString().toLowerCase();

    data.points = parseInt(data.points);

    if (data.type == 'packing'){
      data.type = 'invoice';
    }

    var val = data.points > 0 ? '+'+ data.points : data.points;
    var userPoints = UsersProvider.get(data.userId);

    History.info(user.id, 'Balanço de Pontos', 'Acerto manual de pontos\n' + userPoints.name + ' recebeu '  + val + '  Pontos de ' + typeStr + '\n' + data.obs, 'Pontos');
    Day.sync(new Day(data.userId, Dat.now(), data.type, 0 ,0 , data.points));

    callback();
  },


  packingRemovingPointsFromPicker(user, picker, points, saleNumber, callback){
    var type = 'picking';
    points = -Math.abs(points);
    var obs = 'Faltaram ' + Math.abs(points) + ' items no picking do pedido ' + saleNumber;

    History.info(user.id, 'Picking Incompleto', 'Acerto automático de pontos\n' + picker.name + ' recebeu '  + points + '  Pontos de ' + Str.capitalize(type) + '\n' + obs, 'Pontos');
    Day.sync(new Day(picker.id, Dat.now(), type, 0 ,0 , points));

    callback();
  }


};
