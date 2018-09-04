const Pending = require('../bean/pending.js');
const PendingEmailSender = require('../email/sender/pending-email-sender.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

global.staticPendingSales = [];

module.exports = {


  list(){
    return global.staticPendingSales;
  },

  //---- Load All Elements ----//

  loadAll(clear, callback){
    if (clear || (global.staticPendingSales.length == 0)){
      loadAllPendingSalesFromDB(()=>{
        callback();
      });
    }else{
      callback();
    }
  },


  //---- Store Elements ----//

  store(sale, local, callback){
    sale = removeUnpendingItems(sale);

    var pending = new Pending(sale.numeroPedido, sale, local);

    pending.upsert(()=>{
      //Add new pending sale
      global.staticPendingSales.push(pending);
      callback();
    });
  },


  //---- Update Elements ----//
  
  incrementStatus(pending, callback){
    sendEmailIfNeed(pending, ()=>{
      pending.status = parseInt(pending.status) + 1;
      pending.updateDate = new Date();

      Pending.upsert(Pending.getKeyQuery(pending.number), pending, function(err, doc){
        updatePendingSale(pending);
        callback(pending, err);
      });
    });
  },


  //---- Remove Elements ----//

  remove(saleNumber){
    Pending.removeAll(Pending.getKeyQuery(saleNumber));
    global.staticPendingSales = global.staticPendingSales.filter((i)=>{
      return i.number != saleNumber;
    });
  }

};


function sendEmailIfNeed(pending, callback){
  if (pending.status == 0 && pending.sendEmail.toString() == "true"){
    var sale = pending.sale;

    EccosysCalls.getClient(sale.idContato, (data)=>{
      var client = JSON.parse(data)[0];
      var pendingEmailSender = new PendingEmailSender();
      pendingEmailSender.client(client.nome, client.email);
      pendingEmailSender.sale(sale);
      pendingEmailSender.send(callback);
    });
  }else{
    callback();
  }
}

function loadAllPendingSalesFromDB(callback){
  Pending.findAll(function(err, pendings){

    pendings.sort(function(a, b) {
      return a.status < b.status ? 1 : a.status > b.status ? -1 : 0;
    });

    global.staticPendingSales = pendings;
    callback();
  });
}

function removeUnpendingItems(sale){
  sale.items = sale.items.filter(function (item){
    return item.pending !== undefined && item.pending.toString() == "true";
  });

  return sale;
}

function updatePendingSale(pending){
  global.staticPendingSales = global.staticPendingSales.map(function(i) { return i.sale.numeroPedido == pending.sale.numeroPedido ? pending : i; });
}
