const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const HistoryStorer = require('../history/history-storer.js');
const Err = require('../error/error.js');

//Current picking
global.inprogressPicking = {};

module.exports = {

  object(){
    return global.inprogressPicking;
  },

  checkAndThrowUserInProgress(userId){
    if (this.checkUserInProgress(userId)){
      Err.thrw('O usuário ' + UsersProvider.get(userId).name + ' já tem um pedido em processo de picking.');
    }

    return false;
  },

  checkUserInProgress(userId){
    return this.object()[userId] != undefined;
  },

  getInProgressSale(userId){
    return this.object()[userId];
  },

  remove(saleNumber){
    Util.forProperty(this.object(), (item, key)=>{
      if (item.numeroPedido === saleNumber){
        delete this.object()[key];
      }
    });
  },

  startPicking(sale, userId, doNotCount){
    var begin = new Date();

    if (!doNotCount){
      begin.setSeconds(begin.getSeconds() + 10);
    }

    sale.begin = begin;
    sale.end = null;
    sale.doNotCount = doNotCount;
    sale.pickUser = UsersProvider.get(userId);
    this.object()[userId] = sale;

    HistoryStorer.picking(userId, sale, null);

    //console.log('[Abriu] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);
  },

  endPicking(userId, callback){
    var sale = this.getInProgressSale(userId);
    sale.end = new Date();

    checkEndTime(sale);

    var day = Day.picking(userId, Dat.today(), getItemsQuantity(sale), getSecondsDiference(sale));
    //console.log('[Fechou] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);
    this.remove(sale.numeroPedido);

    HistoryStorer.picking(userId, sale, day);

    if(sale.doNotCount){
      callback(sale);
    }else{
      Day.sync(day, (err, doc) => {
        console.log(err);
        callback(sale);
      });
    }
  },

  getSaleNumbers(){
    return Object.values(this.object()).map(a => a.numeroPedido);
  }

};


function checkEndTime(sale){
  var secs = getSecondsDiference(sale);
  //Calcula 3 segundos por item do pedido no mínimo
  var minSecs = sale.itemsQuantity * 3;
  if (secs < minSecs){
    Err.thrw('Tempo insuficiente para realizar o picking do pedido ' + sale.numeroPedido + '. Tempo mínimo é: ' + minSecs + ' segundos. Você levou ' + secs + ' segundos.');
  }
}

function getSecondsDiference(sale){
  return (sale.end.getTime() - sale.begin.getTime()) / 1000;
}

function getItemsQuantity(sale){
  return parseInt(sale.itemsQuantity);
}
