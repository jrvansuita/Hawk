const BlockLaws = require('../laws/block-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const HistoryStorer = require('../history/history-storer.js');
const PickingLaws = require('../laws/picking-laws.js');
const UsersProvider = require('../provider/user-provider.js');
const BlockRule = require('../bean/block-rule.js');

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

  _checkAndBlockSaleFromPicking(blockRule, callback){
    var salesBlocked = 0;
    //Remove all sales that matchs the new block
    //Using slice() to create a copy to not remove from the list itselfs
    PickingLaws.getFullList().slice().forEach((eachSale)=>{
      if (BlockLaws.checkAndCapture(blockRule, eachSale)){
        PickingLaws.remove(eachSale);
        salesBlocked++;
      }
    });

    if (callback){
      callback(salesBlocked);
    }
  },

  store(blockNumber, user, reasonTag, callback){
    BlockLaws.store(blockNumber, user, reasonTag, (blockRule)=>{
      HistoryStorer.blocked(user.id, blockNumber, true);
      this._checkAndBlockSaleFromPicking(blockRule, callback);
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

  //Bloquear automaticamente Skus da pendencia
  pendingSkus(sale, user){
    var skus = sale.items
    .filter((i) => {return i.pending})
    .map((i)=>{
      return i.codigo;
    });

    //Crio uma function para iterar automaticamente
    blockSkusRun =  (skus, index, count, callback) => {
      var sku = skus[index];

      if (sku){
        //Crio uma regra de bloqueio
        var blockRule = new BlockRule(sku, user,  '994');

        //Verifico se com essa regra, bloqueia algum pedido
        this._checkAndBlockSaleFromPicking(blockRule, (blocksCount)=>{

          if (blocksCount){
            //Se bloquear 1 ou mais pedidos, eu incluo o registro na tabela
            BlockLaws.storeFrom(blockRule, (blockRule)=>{
              count += blocksCount;
              index++;
              blockSkusRun(skus, index, count, callback);
            });
          }

        });
      }else{
        callback(count);
      }
    };

    blockSkusRun(skus, 0, 0, (salesBlockedCount)=>{
      if (salesBlockedCount){
        HistoryStorer.blockedPendingSkus(user.id, skus, sale.numeroPedido, salesBlockedCount);
      }
    });
  },


};
