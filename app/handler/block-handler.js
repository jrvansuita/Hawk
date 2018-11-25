const BlockLaws = require('../laws/block-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const HistoryStorer = require('../history/history-storer.js');
const PickingLaws = require('../laws/picking-laws.js');


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


  _removeFromPendingSalesIfNeeded(blockRule){
    if (blockRule.reasonTag !== '994'){
      PendingLaws.remove(blockRule.number);
    }
  },

  _checkAndRestoreBlockedSalesToPicking(){
    BlockLaws.refreshBlockedSales((sale)=>{
        PickingLaws.add(sale);
    });
  },
 
  _checkAndBlockSaleFromPicking(blockRule){
    //Remove all sales that matchs the new block
    PickingLaws.filter((sale)=>{
      return !BlockLaws.checkAndCapture(blockRule, sale);
    });
  },

  store(blockNumber, user, reasonTag, callback){
    BlockLaws.store(blockNumber, user, reasonTag, (blockRule)=>{
      HistoryStorer.blocked(user.id, blockNumber, true);
      this._removeFromPendingSalesIfNeeded(blockRule);
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

  toggle(blockNumber, user, reasonTag, callback){
    var block = BlockLaws.get(blockNumber);

    if (block) {
      this.remove(block, user, callback);
    }else{
      this.store(blockNumber, user, reasonTag, callback);
    }
  },


};
