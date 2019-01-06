const Pending = require('../bean/pending.js');
const HistoryStorer = require('../history/history-storer.js');

global.staticPendingSales = [];

module.exports = {


  getList(){
    return global.staticPendingSales;
  },

  find(saleNumber){
    return this.getList().find((pending)=>{
      return pending.number == saleNumber;
    });
  },

  update(pending, callback){
    Pending.upsert(Pending.getKeyQuery(pending.number), pending, function(err, doc){
      updatePendingSale(pending);
      if (callback){
        callback(pending, err);
      }
    });
  },

  //---- Load All Elements ----//

  load(clear, callback){
    if (clear || (this.getList().length == 0)){
      loadAllPendingSalesFromDB(()=>{
        callback(this.getList());
      });
    }else{
      callback(this.getList());
    }
  },


  //---- Store Elements ----//

  store(sale, local, user, callback){
    sale = removeUnpendingItems(sale);

    var pending = new Pending(sale.numeroPedido, sale, local);

    HistoryStorer.pending(user.id, pending);

    pending.upsert(()=>{
      //Add new pending sale
      this.getList().push(pending);
      callback();
    });
  },



  //---- Update Elements ----//

  incrementStatus(pending, user, callback){
    pending.status = parseInt(pending.status) + 1;
    pending.updateDate = new Date();

    HistoryStorer.pending(user.id, pending);

    this.update(pending, callback);
  },


  //---- Remove Elements ----//

  remove(saleNumber, callback){
    Pending.removeAll(Pending.getKeyQuery(saleNumber), callback);
    global.staticPendingSales = global.staticPendingSales.filter((i)=>{
      return i.number != saleNumber;
    });
  },


  getSaleNumbers(){
    return global.staticPendingSales.map(a => a.number);
  },

  getSaleList(){
    return Object.values(this.getList()).map(pending => pending.sale);
  }


};


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
