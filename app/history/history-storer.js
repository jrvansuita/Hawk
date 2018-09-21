const History = require('../bean/history.js');


module.exports={


  email(user, sale, err){
    var message = 'Pedido: ' + sale.numeroPedido + ' Ordem de Compra: ' + sale.numeroDaOrdemDeCompra;
    message+= '\n Remetente: ' + sale.client.nome + ' - ' + sale.client.email;

    if (err){
      History.error(err, 'Email não Enviado', message);
    }else{
      History.info(user, 'Email Enviado', message, 'Email');
    }
  },


  picking(userId, sale, day){
    onTry(()=>{
      var message = 'Pedido: ' + sale.numeroPedido + ' - ' + sale.client.nome;
      message += '\nItems: ' + day.total + " Secs: " + day.count + ' Pontos gerados: ' + day.points;
      //message += '\n((' + day.total + ') / (' + day.count + '/' + day.total + ')) * 2 = ' + day.points;

      History.notify(userId, 'Picking Realizado', message, 'Picking');
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
