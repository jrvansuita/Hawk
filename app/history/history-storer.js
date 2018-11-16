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
    var message = 'O código ' + blockNumber + ' foi ' + (blocked ? 'bloqueado' : 'desbloqueado');

    History.notify(userId, blocked ? 'Picking Bloqueado' : 'Picking Desbloqueado', message, 'Bloqueio');
  },

  picking(userId, sale, day){
    onTry(()=>{
      var message = 'Pedido: ' + sale.numeroPedido + (sale.client ? ' - ' + sale.client.nome : '');
      message += '\n'+ sale.transport + ' - ' + (sale.client ? sale.client.uf : 'UF Não encontrado') + ' - ' + Num.money(sale.totalProdutos);

      if (day){
        message += '\nItems: ' + day.total + " Secs: " + parseInt(day.count) + ' Pontos gerados: ' + day.points;
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
      }else if(pending.status == 2){
        status= "marcado como resolvido";
        title+= 'Resolvida';
      }else{
        status= "assumido";
        title+= 'Assumida';
      }

      var message = 'Pedido ' + pending.sale.numeroPedido + ' foi ' + status;
      message += '\nOrdem de Compra: ' + pending.sale.numeroDaOrdemDeCompra + ' Localização: ' + pending.local;

      History.notify(userId, title, message, 'Pendência');
    });
  },

  swapItems(saleNumber, targetSku, swapSku, userId){
    onTry(()=>{
      var message = 'Foi realizada a troca do produto ' + targetSku + ' pelo produto ' + swapSku + ' no pedido ' + saleNumber;
      History.notify(userId, 'Troca de Produto' , message, 'Pendência');
    });
  }

};

function onTry(run){
  try{
    run();
  }catch(e){
    console.log('Erro ao gravar histórico');
    console.log(e);
    History.error(e);
  }
}
