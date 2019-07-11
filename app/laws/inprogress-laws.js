const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const HistoryStorer = require('../history/history-storer.js');
const Err = require('../error/error.js');
const User = require('../bean/user.js');

//Current picking
global.inprogressPicking = {};

module.exports = {

  object(){
    return global.inprogressPicking;
  },

  checkAndThrowUserInProgress(userId){
    if (this.checkUserInProgress(userId)){
      Err.thrw(Const.user_already_on_picking.format(UsersProvider.get(userId).name), userId);
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

  get(saleNumber){
    return Util.findByProperty(this.object(), (i)=>{
      return i.numeroPedido === saleNumber;
    });
  },

  startPicking(sale, userId, doNotCount){
    var begin = new Date();

    if (!doNotCount){
      begin.setSeconds(begin.getSeconds() + 3);
    }

    sale.begin = begin;
    sale.end = null;
    sale.doNotCount = doNotCount;
    sale.pickUser = User.suppress(UsersProvider.get(userId));
    this.object()[userId] = sale;

    //HistoryStorer.picking(userId, sale, null);

    //console.log('[Abriu] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);
  },

  endPicking(userId, callback){
    var sale = this.getInProgressSale(userId);
    sale.end = new Date();


    if (!sale.doNotCount){
      checkEndTime(sale, userId);
    }

    var day = Day.picking(userId, Dat.today(), getItemsQuantity(sale), getSecondsDiference(sale));
    //console.log('[Fechou] picking ' + sale.pickUser.name  + ' - ' + sale.numeroPedido);
    this.remove(sale.numeroPedido);

    HistoryStorer.picking(userId, sale, day);

    if(sale.doNotCount || (process.env.NODE_ENV === undefined)){
      callback(sale);
    }else{
      Day.sync(day, (err, doc) => {
        callback(sale);
      });
    }
  },

  getSaleNumbers(){
    return Object.values(this.object()).map(a => a.numeroPedido);
  },

  getSaleList(){
    return Object.values(this.object());
  }

};


function checkEndTime(sale, userId){
  var secs = getSecondsDiference(sale);
  secs = secs < 0 ? 0 : secs;

  //Calcula 3 segundos por item do pedido no mínimo
  var minSecs = sale.itemsQuantity * 8;
  if ((secs < minSecs) && (process.env.NODE_ENV != undefined)){
    Err.thrw(Const.insufficient_picking_time.format(sale.numeroPedido, sale.itemsQuantity, minSecs, parseInt(secs)), userId);
  }
}

function getSecondsDiference(sale){
  return (sale.end.getTime() - sale.begin.getTime()) / 1000;
}

function getItemsQuantity(sale){
  return parseInt(sale.itemsQuantity);
}
