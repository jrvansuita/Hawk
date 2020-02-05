const Pending = require('../bean/pending.js');
const HistoryStorer = require('../history/history-storer.js');
const Day = require('../bean/day.js');


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

  setOrder(){
    var order = [3,0,1];

   this.getList().sort((a, b) => {
      return a.status == b.status ? new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime() : order.indexOf(a.status) - order.indexOf(b.status);
    });
  },

  update(pending, callback){
    Pending.upsert(Pending.getKeyQuery(pending.number), pending, (err, doc)=>{
      updatePendingSale(pending);
      this.setOrder();

      if (callback){
        callback(pending, err);
      }
    });
  },

  //---- Load All Elements ----//

  load(clear, callback){
    if (clear || (this.getList().length == 0)){
      loadAllPendingSalesFromDB(()=>{
        this.setOrder();
        callback(this.getList());
      });
    }else{
      this.setOrder();
      callback(this.getList());
    }
  },


  getFromStatus(status){
    return this.getList().filter((pending)=>{
      return pending.status == status;
    });
  },


  //---- Store Elements ----//

  store(sale, local, user, callback){
    sale = removeUnpendingItemsAndClearSale(sale);

    var pending = new Pending(sale.numeroPedido, sale, local);

    var day = this.handlePendingPoints(pending);

    HistoryStorer.pending(user.id, pending, day);

    pending.upsert((doc, err)=>{

      //Add new pending sale
      this.getList().push(pending);
      this.setOrder();

      callback(pending, sale);
    });
  },

  handlePendingPoints(pending){
    var sale = pending.sale;
    var user = pending.sale.pickUser;

    //Contabilizar Pontos por ter feito o picking dos produtos que achou
    if (!sale.doNotCount){
      var items = parseInt(sale.itemsQuantity) - parseInt(sale.pendingsQuantity);

      if (pending.removePoints){
        items = -Math.abs(items);
      }

      var day = Day.picking(user.id, Dat.today(), null, items);
      Day.sync(day, (err, doc) => {});
      return day;
    }
  },


  //---- Update Elements ----//

  incrementStatus(pending, userOrUserId, callback){
    pending.status = parseInt(pending.status) + 1;
    pending.updateDate = new Date();

    HistoryStorer.pending(userOrUserId.id || userOrUserId, pending);

    this.update(pending, callback);
  },


  //---- Remove Elements ----//

  removeSale(saleNumber, callback){
    Pending.removeAll(Pending.getKeyQuery(saleNumber), callback);
    global.staticPendingSales = global.staticPendingSales.filter((i)=>{
      return i.number != saleNumber;
    });
  },

  remove(pending, user){
    this.removeSale(pending.number);

    pending.status = 3;
    var day = null;

    if (pending.removePoints){
       day = this.handlePendingPoints(pending);
    }

    HistoryStorer.pending(user.id, pending, day);
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

function removeUnpendingItemsAndClearSale(sale){
  sale = Util.removeAttrs(sale, ['id', 'numeroPedido', 'situacao', 'items', 'pickUser', 'transport', 'data', 'doNotCount', 'idContato', 'itemsQuantity', 'numeroDaOrdemDeCompra']);

  sale.items = sale.items.filter(function (item){
    return item.pending !== undefined && item.pending.toString() == "true";
  });

  sale.pendingsQuantity = sale.items.reduce(function(a, b) {
    return a + parseFloat(b.quantidade);
  }, 0);


  return sale;
}

function updatePendingSale(pending){
  global.staticPendingSales = global.staticPendingSales.map(function(i) { return i.sale.numeroPedido == pending.sale.numeroPedido ? pending : i; });
}
