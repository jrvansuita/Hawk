const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const HistoryStorer = require('../history/history-storer.js');

//Current picking
global.inprogressPicking = {};

module.exports = {

  object(){
    return global.inprogressPicking;
  },

  checkAndThrowUserInProgress(userId){
    if (this.checkUserInProgress(userId)){
      throw 'O usuário ' + user.name + ' já tem um pedido em processo de picking.';
    }

    return false;
  },

  checkUserInProgress(userId){
    return this.object()[userId] != undefined;
  },

  removeAndReturn(userId){
    var sale = this.object()[userId];
    delete this.object()[userId];
    return sale;
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

    console.log('[Abriu] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);
  },

  endPicking(userId, callback){
    var sale = this.removeAndReturn(userId);
    sale.end = new Date();

    var day = Day.picking(userId, Dat.today(), getItemsQuantity(sale), getSecondsDiference(sale));
    console.log('[Fechou] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);

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


function getSecondsDiference(sale){
  return (sale.end.getTime() - sale.begin.getTime()) / 1000;
}

function getItemsQuantity(sale){
  return parseInt(sale.itemsQuantity);
}
