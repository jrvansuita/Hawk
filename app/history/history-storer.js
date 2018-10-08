const History = require('../bean/history.js');


module.exports={

  email(userId, sale, err){
    var message = 'Pedido: ' + sale.numeroPedido + ' Ordem de Compra: ' + sale.numeroDaOrdemDeCompra;
    message+= '\n Remetente: ' + sale.client.nome + ' - ' + sale.client.email;

    if (err){
      History.error(err, 'Email não Enviado', message);
    }else{
      History.info(userId, 'Email Enviado', message, 'Email');
    }
  },

  blocked(userId, blockNumber, blocked){
    var message = 'O pedido ' + blockNumber + ' foi ' + (blocked ? 'bloqueado' : 'desbloqueado');

    History.notify(userId, blocked ? 'Pedido Bloqueado' : 'Pedido Desbloqueado', message, 'Bloqueio');
  },

  picking(userId, sale, day){
    onTry(()=>{
      var message = 'Pedido: ' + sale.numeroPedido + (sale.client ? ' - ' + sale.client.nome : '');

      if (day){
        message += '\nItems: ' + day.total + " Secs: " + day.count + ' Pontos gerados: ' + day.points;
        //message += '\n((' + day.total + ') / (' + day.count + '/' + day.total + ')) * 2 = ' + day.points;
      }

      History.notify(userId, day ? 'Picking Finalizado' : 'Picking Iniciado', message, 'Picking');
    });
  },

  pending(userId, pending){
    onTry(()=>{
      var title = 'Pendência ';
      var status = '';

      if (pending.status == 0){
        title+= 'Adicionada';
        status= "adicionado";
      }else if(pending.status == 1){
        title+= 'em Andamento';
        status= "colocado em atendimento";
      }else{
        status= "marcado como resolvido";
        title+= 'Finalizada';
      }

      var message = 'Pedido ' + pending.sale.numeroPedido + ' foi ' + status;
      message += '\nOrdem de Compra: ' + pending.sale.numeroDaOrdemDeCompra;

      History.notify(userId, title, message, 'Pendência');
    });
  }

};

function onTry(run){
  try{
    run();
  }catch(e){
    console.log(e);
    History.error(e);
  }
}
