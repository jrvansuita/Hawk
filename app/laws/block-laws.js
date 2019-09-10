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
      if (this.match(rule, sale)){
        return rule;
      }
    });
  },

  checkAndCapture(block, sale){
    var match = this.match(block, sale);

    if (match){
      console.log('Block ' + sale.numeroPedido + ' -> ' + block.number);
      this.capture(sale);
      block.blockings = ++block.blockings || 0;
    }

    return match;
  },

  match(block, sale){
    if (block.reasonTag.toString() == '994'){
      return sale.items && sale.items.some((item)=>{
        return skuComparation(item.codigo, block.number);
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
    if (global.staticBlockRules.length > 0){
      callback(global.staticBlockRules);
    }else{
      BlockRule.findAll(function(err, all){
        global.staticBlockRules = all;
        callback(global.staticBlockRules);
      });
    }
  },

  get(blockNumber){
    return this.rules().find((i)=>{
      return i.number.toLowerCase() == blockNumber.toLowerCase();
    });
  },

  storeFrom(blockRule, callback){
    this.rules().push(blockRule);
    //Cria um novo block rule para não enviar as quantidades de blockqueados
    new BlockRule(blockRule.number, blockRule.user, blockRule.reasonTag).upsert(()=>{
      callback(blockRule);
    });
  },

  store(blockNumber, user, reasonTag, callback){
    var rule = new BlockRule(blockNumber, user, reasonTag);

    this.rules().push(rule);

    rule.upsert(()=>{
      callback(rule);
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

  removeSale(sale){
    var rule = this._matchAnyRule(sale);
    rule.blockings--;

    var index = this.list().findIndex((i)=>{
      return i.numeroPedido == sale.numeroPedido;
    });

    this.list().splice(index, 1);
  }

};


function skuComparation(sku, macthingStr){
  if (sku){
    if (!macthingStr.includes('-')){
      sku = sku.split('-')[0];
    }

    return sku.toLowerCase() == macthingStr.toLowerCase();
  }

  return false;
}
