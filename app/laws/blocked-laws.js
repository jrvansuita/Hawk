const BlockedSale = require('../bean/blocked-sale.js');
const UsersProvider = require('../provider/UsersProvider.js');
const PendingLaws = require('../laws/pending-laws.js');

//All Blocked Sales wich can't be picking now
global.staticBlockedSales = [];


module.exports = {

  list(){
    return global.staticBlockedSales;
  },

  assert(saleList){
    var blocks = this.getAllSales();

    if (blocks){
      saleList = saleList.filter(sale =>{
        return !(blocks.includes(sale.numeroPedido) || blocks.includes(sale.numeroDaOrdemDeCompra));
      });
    }

    return saleList;
  },

  load(callback){
    BlockedSale.findAll(function(err, all){
      global.staticBlockedSales = all;
      callback();
    }); 
  },

  remove(blockSale){
    var index = this.list().indexOf(blockSale);

    if (index >= 0){
      blockSale.remove();
      this.list().splice(index, 1);
    }
  },

  get(saleNumber){
    return this.list().find((i)=>{
      return i.number == saleNumber;
    });
  },

  store(saleNumber, user, reason, callback){
    var blockedSale = new BlockedSale(saleNumber, user, reason);
    blockedSale.upsert(()=>{
      this.list().push(blockedSale);
      PendingLaws.remove(saleNumber);
      callback();
    });
  },


  toggleBlock(saleNumber, user, reason, callback){
    var blocked = this.get(saleNumber);

    if (blocked) {
      this.remove(blocked);
      callback();
    }else{
      this.store(saleNumber, user, reason, callback);
    }
  },

  getAllSales(){
    return this.list().map(a => a.number);
  }

};
