const PendingLaws = require('../laws/pending-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const EmailBuilder = require('../email/builder/email-builder.js');

const HistoryStorer = require('../history/history-storer.js');
const BlockHandler = require('../handler/block-handler.js');


module.exports = {

  load(clear, callback){
    PendingLaws.load(clear, callback);
  },

  updateItem(saleNumber, targetSku, swapItem, callback){
    var pending  = PendingLaws.find(saleNumber);
    var items = pending.sale.items;
    var changed = false;

    for(var i=0; i < items.length; i++) {
      var item = items[i];

      if (item.codigo.toLowerCase() == targetSku.toLowerCase()){
        items[i] = swapItem;
        items[i].changed = true;
        changed = true;
        break;
      }
    }

    if (changed){
      PendingLaws.update(pending, callback);
    }
  },

  store(sale, local, user, callback){
    PendingLaws.store(sale, local, user, (pending)=>{
      PickingLaws.remove(sale);
      InprogressLaws.remove(sale.numeroPedido);
      BlockHandler.pendingSkus(sale, user);

      callback();
    });
  },

  incStatus(pending, user, callback){
    var foundPending  = PendingLaws.find(pending.number);

    if (foundPending && foundPending.status < 2){

      foundPending.sendEmail = pending.sendEmail != undefined && pending.sendEmail.toString() == 'true';

      sendEmailIfNeed(foundPending, user, ()=>{
        PendingLaws.incrementStatus(foundPending, user, callback);
      });
    }else{
      //A tela não foi atualizada, porque esse pedido já não pode mais ser incrementado
      callback();
    }
  },

  restart(pending, user, callback){
    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {
      var number = pending.number;
      var originalUserId = pending.sale.pickUser.id;

      PendingLaws.remove(pending, user);

      new SaleLoader(number)
      .loadClient()
      .reloadItems()
      .run(function(sale){
        InprogressLaws.startPicking(sale, user.id, true, originalUserId);
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

    }else if (sale.idContato){
      new EccosysProvider().client(sale.idContato).go((client)=>{
        sale.client = client;
        sendEmail(sale, user, callback);
      });
    }else{
      pending.sendEmail = false;
    }
  }else{
    callback();
  }
}

function sendEmail(sale, user, callback){
  var items = sale.items.filter((i) => {
    i.img = Params.productionUrl() + "/sku-image?sku=" + i.codigo;
    i.total = parseFloat(i.precoLista) * parseFloat(i.quantidade);
    return i.pending == true;
  });


  new EmailBuilder()
  .template('PENDING')
  .to(sale.client.email)
  .receiveCopy()
  .reply(Params.replayEmail())
  .setData({
    pedido: sale,
    cliente: sale.client,
    produtos: items
  }).send((err, sucessId) => {
    HistoryStorer.email(user.id, sale, err);
    callback(err, sucessId);
  });



}
