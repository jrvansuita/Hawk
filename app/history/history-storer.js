const History = require('../bean/history.js');


module.exports={

  email(userId, sale, err){
    console.log(userId);
    var message = 'Pedido: ' + sale.numeroPedido + ' Ordem de Compra: ' + sale.numeroDaOrdemDeCompra;
    message+= '\n Destinatário: ' + sale.client.nome + ' - ' + sale.client.email;

    if (err){
      message+= '\n' + err.message;
      History.error(err, 'Email não Enviado', message);
    }else{
      History.notify(userId, 'Email Enviado', message, 'Email');
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

  packingRejected(userId, saleNumber, oc,  error){
    onTry(()=>{
      var message = 'Pedido: ' + saleNumber + ' - Ordem de Compra: ' + oc;

      if (error){
        message += '\nErro: ' + error;
      }

      History.notify(userId, 'Packing Rejeitado', message, 'Packing');
    });
  },

  pending(userId, pending, day){
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
      message += '\nLocalização: ' + pending.local;
      message+=emailStr;

      if (day){

        if (day.total < 0){
          message += '\nAcerto automático de pontos: ' + pending.sale.pickUser.name + ' recebeu ' + day.total + ' Pontos de Picking\n Foram encontrados o(s) ' + parseInt(pending.sale.pendingsQuantity) + ' iten(s) colocados em pendência';
        }else{
          message += '\nItems Coletados: ' + day.total + " Pendências: " + parseInt(pending.sale.pendingsQuantity) + ' Pontos gerados: ' + day.points;
        }
      }

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
