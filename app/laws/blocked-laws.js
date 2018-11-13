const BlockedSale = require('../bean/blocked-sale.js');
const UsersProvider = require('../provider/UsersProvider.js');
const PendingLaws = require('../laws/pending-laws.js');
const HistoryStorer = require('../history/history-storer.js');

//All Blocked Sales wich can't be picking now
global.staticBlockedSales = [];


module.exports = {

  list(){
    return global.staticBlockedSales;
  },


  assert(saleList){
    for(var i=0; i < this.list().length; i++){
      var block = this.list()[i];

      if (block.reason.tag == 994){
        saleList = saleList.filter((sale)=>{
          return !sale.items.some((item)=>{
            return item.codigo.toLowerCase().indexOf(block.number.toLowerCase()) > -1;
          });
        });
      }else{
        saleList = saleList.filter( (sale)=>{
          return !(sale.numeroPedido == block.number || sale.numeroDaOrdemDeCompra == block.number);
        });
      }
    }


    return saleList;

  },

  oldassert(saleList){
    var blocks = this.getAllBlocks();

    if (blocks){
      saleList = saleList.filter((sale) =>{
        var block = this.get(sale.numeroPedido, sale.numeroDaOrdemDeCompra);

        if (block){
          //If the block is blocking any sale
          block.blocking = true;
        }

        console.log(block);

        return !block;
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

  get(blockNumber, alternative){
    return this.list().find((i)=>{
      return i.number == blockNumber || i.number == alternative;
    });
  },

  store(saleNumber, user, reason, callback){
    var blockedSale = new BlockedSale(saleNumber, user, reason);
    blockedSale.upsert(()=>{
      this.list().push(blockedSale);
      HistoryStorer.blocked(user.id, saleNumber, true);
      PendingLaws.remove(saleNumber);
      callback();
    });
  },


  toggleBlock(saleNumber, user, reason, callback){
    var blocked = this.get(saleNumber);

    if (blocked) {
      HistoryStorer.blocked(user.id, saleNumber, false);
      this.remove(blocked);
      callback();
    }else{
      this.store(saleNumber, user, reason, callback);
    }
  },

  getAllBlocks(){
    return this.list().map(a => a.number);
  }

};
