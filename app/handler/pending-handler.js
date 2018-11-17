const PendingLaws = require('../laws/pending-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PendingEmailSender = require('../email/sender/pending-email-sender.js');
const HistoryStorer = require('../history/history-storer.js');

module.exports = {


  load(clear, callback){
    PendingLaws.load(clear, callback);
  },

  updateItem(saleNumber, targetSku, swapItem, callback){
    var pending  = PendingLaws.find(saleNumber);

    pending.sale.items.forEach((item, index, arr)=>{
      if (item.codigo.toLowerCase() == targetSku.toLowerCase()){
        arr[index] = swapItem;
        arr[index].changed = true;
      }
    });

    PendingLaws.update(pending, callback);
  },  

  store(sale, local,user, callback){
    PendingLaws.store(sale, local, user, ()=>{
      PickingLaws.remove(sale);
      InprogressLaws.remove(sale.numeroPedido);

      callback();
    });
  },

  incStatus(pending, user, callback){
    sendEmailIfNeed(pending, user, ()=>{
      PendingLaws.incrementStatus(pending,user, callback);
    });
  },

  restart(pending, user, callback){
    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {
      PendingLaws.remove(pending.number);
      pending.status = 3;

      HistoryStorer.pending(user.id, pending);

      new SaleLoader(pending.sale.numeroPedido)
      .loadClient()
      .loadItems()
      .run(function(sale){
        InprogressLaws.startPicking(sale, user.id, true);
        callback();
      });
    }
  }

};


function sendEmailIfNeed(pending, user,  callback){
  if (pending.status == 0 && pending.sendEmail.toString() == "true"){
    var sale = pending.sale;


    if (sale.client){
      sendEmail(sale, user, callback);

    }else{
      EccosysCalls.getClient(sale.idContato, (client)=>{
        sale.client = client;
        sendEmail(sale, user, callback);
      });
    }
  }else{
    callback();
  }
}

function sendEmail(sale, user, callback){
  var pendingEmailSender = new PendingEmailSender();
  pendingEmailSender.client(sale.client.nome, sale.client.email);
  pendingEmailSender.sale(sale);
  pendingEmailSender.send((err, sucessId)=>{
    HistoryStorer.email(user, sale, err);
    callback(err, sucessId);
  });
}
