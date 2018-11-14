const BlockRule = require('../bean/block-rule.js');
const UsersProvider = require('../provider/UsersProvider.js');
const PendingLaws = require('../laws/pending-laws.js');
const HistoryStorer = require('../history/history-storer.js');
const PickingLaws = require('../laws/picking-laws.js');

//All Blocked Rules wich can't be picking now
global.staticBlockRules = [];
global.staticBlockedSales = [];


module.exports = {

  rules(){
    return global.staticBlockRules;
  },

  checkAllAndCapture(sale, ignoreBlocking){
    var isBlocked = false;

    for(var i=0; i < this.rules().length; i++){
      var block = this.rules()[i];

      if (ignoreBlocking || (!block.blocking || block.reason.tag.toString() == '994')){

        isBlocked = this.checkAndCapture(block, sale);

        if (isBlocked){
          break;
        }
      }
    }

    return isBlocked;
  },

  checkAndCapture(block, sale){
    var isBlocked = this.match(block, sale);

    if (isBlocked){
      if (global.staticBlockedSales.indexOf(sale) === -1)  global.staticBlockedSales.push(sale);
      block.blocking = true;
    }

    return isBlocked;
  },

  match(block, sale){
    if (block.reason.tag == 994){
      return !sale.items || sale.items.some((item)=>{
        return item.codigo.toLowerCase().indexOf(block.number.toLowerCase()) > -1;
      });
    }else{
      return (sale.numeroPedido == block.number || sale.numeroDaOrdemDeCompra == block.number);
    }
  },

  load(callback){
    BlockRule.findAll(function(err, all){
      global.staticBlockRules = all;
      callback();
    });
  },

  get(blockNumber){
    return this.rules().find((i)=>{
      return i.number == blockNumber;
    });
  },

  store(saleNumber, user, reason, callback){
    var blockRule = new BlockRule(saleNumber, user, reason);
    blockRule.upsert(()=>{
      this.rules().push(blockRule);
      HistoryStorer.blocked(user.id, saleNumber, true);
      PendingLaws.remove(saleNumber);

      //Remove all sales that matchs the new block
      PickingLaws.filter((sale)=>{
        return !this.checkAndCapture(blockRule, sale);
      });

      callback();
    });
  },

  remove(blockRule){
    var index = this.rules().indexOf(blockRule);

    if (index >= 0){
      blockRule.remove();
      this.rules().splice(index, 1);

      global.staticBlockedSales = global.staticBlockedSales.filter((sale)=>{
        var restore = !this.checkAllAndCapture(sale, true);

        if (restore){
          PickingLaws.add(sale);
        }

        return !restore;
      });

    }
  },


  toggleBlock(blockNumber, user, reason, callback){
    var blocked = this.get(blockNumber);

    if (blocked) {
      HistoryStorer.blocked(user.id, blockNumber, false);
      this.remove(blocked);
      callback();
    }else{
      this.store(blockNumber, user, reason, callback);
    }
  },

  getAllBlocks(){
    return this.rules().map(a => a.number);
  }

};
