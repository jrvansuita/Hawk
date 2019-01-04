const BlockRule = require('../bean/block-rule.js');

//All Blocked Rules wich can't be picking now
global.staticBlockRules = [];
global.staticBlockedSales = [];


module.exports = {

  clear(){
    global.staticBlockedSales = [];
  },

  rules(){
    return global.staticBlockRules;
  },

  list(){
    return global.staticBlockedSales;
  },

  refreshBlockedSales(onUnblockSale){
    global.staticBlockedSales = global.staticBlockedSales.filter((sale)=>{
      if (this._matchAnyRule(sale)){
        return true;
      }else{
        onUnblockSale(sale);
        return false;
      }
    });
  },

  _matchAnyRule(sale){
    return this.rules().some((rule)=>{
      return this.match(rule, sale);
    });
  },

  checkAndCapture(block, sale){
    var match = this.match(block, sale);

    if (!block.blockings)
    block.blockings = 0;

    if (match){
      console.log('Block ' + sale.numeroPedido + ' -> ' + block.number);
      this.capture(sale);
      block.blockings++;
    }

    return match;
  },

  match(block, sale){
    if (block.reasonTag.toString() == '994'){
      return sale.items && sale.items.some((item)=>{
        return item.codigo.toLowerCase() == block.number.toLowerCase();
      });
    }else{
      return (sale.numeroPedido == block.number || sale.numeroDaOrdemDeCompra == block.number);
    }
  },

  capture(sale){
    if (this.list().indexOf(sale) === -1)  {
      this.list().push(sale);
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
      return i.number.toLowerCase() == blockNumber.toLowerCase();
    });
  },


  store(blockNumber, user, reasonTag, callback){
    var blockRule = new BlockRule(blockNumber, user, reasonTag);

    this.rules().push(blockRule);

    blockRule.upsert(()=>{
      callback(blockRule);
    });
  },

  remove(blockRule, callback){
    var index = this.rules().indexOf(blockRule);

    if (index >= 0){
      blockRule.remove();
      this.rules().splice(index, 1);
      callback();
    }
  },



};
