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

  blockedPendingSkus(userId, skus, pendingNumber, salesBlockeds){
    var message = 'Alguns skus foram bloquados automaticamente pelo pedido de pendência ' + pendingNumber;

    if (salesBlockeds){ 
      message+= '\nForam bloqueados +' + salesBlockeds + ' pedidos que continham os mesmos produtos';
    }

    message += '\nSkus Bloqueados: ' + skus.join(', ');

    History.notify(userId, 'Picking Bloqueado' , message, 'Bloqueio');
  },

  picking(userId, sale, day){
    onTry(()=>{
      var message = 'Pedido: ' + sale.numeroPedido + (sale.client ? ' - ' + sale.client.nome : '');
      message += '\n'+ 'OC: ' + sale.numeroDaOrdemDeCompra + ' - ' + sale.transport + ' - ' + (sale.client ? sale.client.uf : 'UF Não encontrado') + ' - ' + Num.money(sale.totalProdutos);

      if (day){
        message += '\nItems: ' + day.total + " Secs: " + parseInt(day.count) + ' Pontos gerados: ' + day.points;
        //message += '\n((' + day.total + ') / (' + day.count + '/' + day.total + ')) * 2 = ' + day.points;
      }

      History.notify(userId, day ? 'Picking Finalizado' : 'Picking Iniciado', message, 'Picking');
    });
  },

  packing(userId, sale, day){
    onTry(()=>{
      var message = 'Pedido: ' + sale.numeroPedido +  (sale.client ? ' - ' + sale.client.nome : '');
      message += '\n'+ 'OC: ' + sale.numeroDaOrdemDeCompra + ' - ' + sale.transport + ' - ' + (sale.client ? sale.client.uf : 'UF Não encontrado') + ' - ' + Num.money(sale.totalProdutos);

      if (day){
        message += '\nItems: ' + sale.itemsQuantity + ' Pontos gerados: ' + day.points;
      }

      History.notify(userId, 'Packing Finalizado', message, 'Packing');
    });
  },

  packingRejected(userId, saleNumber, error){
    onTry(()=>{
      var message = 'Pedido: ' + saleNumber;

      if (error){
        message += '\nError: ' + error;
      }

      History.notify(userId, 'Packing Rejeitado', message, 'Packing');
    });
  },

  pending(userId, pending){
    onTry(()=>{
      var title = 'Pendência ';
      var status = '';
      var emailStr = '';

      if (pending.status == 0){
        title+= 'Adicionada';
        status= "adicionado";
      }else if(pending.status == 1){
        title+= 'em Andamento';
        status= "colocado em atendimento";

        if (pending.sendEmail){
          emailStr = '\nEnviado email para o cliente';
        }else{
          emailStr = '\nNão foi enviado email para o cliente';
        }
      }else if(pending.status == 2){
        status= "marcado como resolvido";
        title+= 'Resolvida';
      }else{
        status= "assumido";
        title+= 'Assumida';
      }

      var message = 'Pedido ' + pending.sale.numeroPedido + ' foi ' + status;
      message += '\nOrdem de Compra: ' + pending.sale.numeroDaOrdemDeCompra + ' Localização: ' + pending.local;
      message+=emailStr;


      History.notify(userId, title, message, 'Pendência');
    });
  },

  swapItems(saleNumber, targetSku, swapSku, quantity,  userId){
    onTry(()=>{
      History.notify(userId, 'Troca de Produto' , Const.swaped_items.format(quantity, targetSku, swapSku, saleNumber), 'Pendência');
    });
  }

};

function onTry(run){
  try{
    run();
  }catch(e){
    console.log('Erro ao gravar histórico: ' + e.toString());
    History.error(e);
  }
}
