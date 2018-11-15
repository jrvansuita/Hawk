const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const History = require('../bean/history.js');
const Err = require('../error/error.js');

//Nexts sales to pick
global.staticPickingList = [];
global.lastClear = 0;
global.pickingPrintUrl =  "https://" + process.env.ECCOSYS_HOST + "/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N&idsVendas=";

module.exports = {

  set(list){
    global.staticPickingList = list;
    global.lastClear = new Date().getTime();
  },

  add(sale){
    global.staticPickingList.unshift(sale);
  },

  handleDevMode(){
    checkIsInDevMode();
  },

  assert(saleNumbers){
    this.filter((item, index)=>{
      return !saleNumbers.includes(item.numeroPedido);
    });
  },

  filter(callback){
    global.staticPickingList = global.staticPickingList.filter(callback);
  },

  get(saleNumber){
    return global.staticPickingList.find(sale => sale.numeroPedido == saleNumber);
  },

  remove(inputSale){
    global.staticPickingList = global.staticPickingList.filter(sale => sale.id != inputSale.id);
  },

  next(userId, howMuch, onNextSales){
    if (this.getList().length == 0){
      Err.thrw(Const.none_sale_founded, userId);
    }

    var pickingList = getAssertedList();

    if (pickingList.length == 0){
      Err.thrw(Const.none_sale_founded_asserted, userId);
    }

    //Get the next sale from list
    var sale = pickingList[0];

    /*if (onNextSales && howMuch){
      onNextSales(pickingList.slice(1, howMuch));
    }*/

    this.remove(sale);
    return sale;
  },

  printUrl(sale){
    return global.pickingPrintUrl + sale.id;
  },

  isEmpty(){
    return this.getList().length == 0;
  },

  isFullEmpty(){
    return global.staticPickingList.length == 0;
  },

  getFullList(){
    return global.staticPickingList;
  },

  getList(){
    return getAssertedList();
  },

  clear(userId){
    var now = new Date().getTime();
    var salesCount = 1000;//this.getFullList().length;

    var minTime =  salesCount * 60000;
    var nextClear = global.lastClear + minTime;

    if ((salesCount <= 50) || (nextClear < now)){
      //Limpa a lista de picking
      this.set([]);
      //Limpa a lista de pedidos bloqueados
      global.staticBlockedSales = [];
      History.job(Const.picking_update, Const.starting_picking_update, 'Eccosys', userId);
    }else{
      History.job(Const.picking_update, Const.cant_starting_picking_update.format(Math.trunc((nextClear - now) / (1000 * 60 * 60))), 'Eccosys', userId);
    }
  }
};



function getAssertedList(){
  var list = global.staticPickingList;
  list = TransportLaws.assert(list);
  list = UfLaws.assert(list);
  //list = BlockedLaws.assert(list);

  return list;
}


function checkIsInDevMode(){
  var maxSalesOnDevMove = 12;
  //If this Env Var is not defined, it's on development mode
  //Not necessary to load all sales for tests porpouse
  if (!process.env.NODE_ENV){
    if (global.staticPickingList.length > maxSalesOnDevMove){
      global.staticPickingList.splice(maxSalesOnDevMove);
    }
  }
}
