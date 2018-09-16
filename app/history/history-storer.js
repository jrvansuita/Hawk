const History = require('../bean/history.js');


module.exports={


  picking(userId, sale, day){

    var message = 'Pedido: ' + sale.numeroPedido + ' - ' + sale.client.nome;
    message += '\nQuantidade de Items: ' + day.total + " Segundos: " + day.count;
    message += '\n((' + day.total + ') / (' + day.count + '/' + day.total + ')) * 2 = ' + day.points;
    message += '\nPontos gerados: ' + day.points;

    History.notify(userId, 'Picking Realizado', message, 'Picking');
  }

};
