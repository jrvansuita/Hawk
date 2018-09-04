const BlockedSale = require('../bean/blocked-sale.js');
const UsersProvider = require('../provider/UsersProvider.js');

//All Blocked Sales wich can't be picking now
global.staticBlockedSales = [];


module.exports = {

  list(){
    return global.staticBlockedSales;
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

  store(saleNumber, user, callback){
    var blockedSale = new BlockedSale(saleNumber, user, new Date());
    blockedSale.upsert(()=>{
      this.list().push(blockedSale);
      callback();
    });
  },


  toggleBlock(saleNumber, user, callback){
    var blocked = this.get(saleNumber);

    if (blocked) {
      this.remove(blocked);
      callback();
    }else{
      this.store(saleNumber, user, callback);
    }
  },

  getAllBlocks(){
    return this.list().map(a => a.number);
  }

};
