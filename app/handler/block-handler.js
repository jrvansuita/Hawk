const BlockLaws = require('../laws/block-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const HistoryStorer = require('../history/history-storer.js');
const PickingLaws = require('../laws/picking-laws.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports = {

  load(callback){
    BlockLaws.load(callback);
  },


  rules(){
    return BlockLaws.rules();
  },

  getBlockedSalesCount(){
    return BlockLaws.list().length;
  },

  hasBlockSales(){
    return BlockLaws.list().length > 0;
  },


  get(blockNumber){
    return BlockLaws.get(blockNumber);
  },

  checkAllBlocksAndCapture(sale){
    var isBlocked = false;
    var rules = BlockLaws.rules();

    for(var i=0; i < rules.length; i++){
      isBlocked = BlockLaws.checkAndCapture(rules[i], sale);

      if (isBlocked){
        break;
      }
    }

    return isBlocked;
  },




  _checkAndRestoreBlockedSalesToPicking(){
    BlockLaws.refreshBlockedSales((sale)=>{
      PickingLaws.add(sale);
    });
  },

  _checkAndBlockSaleFromPicking(blockRule){
    //Remove all sales that matchs the new block
    //Not using PickingLaws.filter because I need to keep no mutated the object global.staticPickingList
    PickingLaws.getFullList().forEach((eachSale)=>{
      if (BlockLaws.checkAndCapture(blockRule, eachSale)){
        PickingLaws.remove(eachSale);
      }
    });
  },

  store(blockNumber, user, reasonTag, callback){
    BlockLaws.store(blockNumber, user, reasonTag, (blockRule)=>{
      HistoryStorer.blocked(user.id, blockNumber, true);
      this._checkAndBlockSaleFromPicking(blockRule);
      callback();
    });
  },

  remove(blockRule, user,  callback){
    BlockLaws.remove(blockRule, ()=>{
      HistoryStorer.blocked(user.id, blockRule.number, false);
      this._checkAndRestoreBlockedSalesToPicking();
      callback();
    });
  },

  toggle(blockNumber, userId, reasonTag, callback){
    var block = BlockLaws.get(blockNumber);
    var user = UsersProvider.get(userId);

    if (block) {
      this.remove(block, user, callback);
    }else{
      this.store(blockNumber, user, reasonTag, callback);
    }
  },


  pendingSkus(sale, user){
    var skus = sale.items.map((i)=>{
      return i.codigo;
    });


    blockSkusRun =  (skus, index, callback) => {
      if (skus[index]){
        BlockLaws.store(skus[index], user, '994', (blockRule)=>{
          console.log(blockRule);
          this._checkAndBlockSaleFromPicking(blockRule);
          index++;
          blockSkusRun(skus, index, callback);
        });
      }else{
        callback();
      }
    };

    blockSkusRun(skus, 0, ()=>{
      HistoryStorer.blockedPendingSkus(user.id, skus, sale.numeroPedido);
    });
  },


};
