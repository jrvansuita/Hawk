const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const History = require('../bean/history.js');
const Err = require('../error/error.js');

//Nexts sales to pick
global.staticPickingList = [];
global.lastClear = 0;
global.pickingPrintUrl =  "https://" + process.env.ECCOSYS_HOST + "/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N&idsVendas=";

module.exports = {

  set(list){
    global.staticPickingList = list;
  },

  handleDevMode(){
    checkIsInDevMode();
  },

  assert(saleNumbers){
    global.staticPickingList = global.staticPickingList.filter((item, index)=>{
      return !saleNumbers.includes(item.numeroPedido);
    });
  },

  get(saleNumber){
    return global.staticPickingList.find(sale => sale.numeroPedido == saleNumber);
  },

  remove(inputSale){
    global.staticPickingList = global.staticPickingList.filter(sale => sale.id != inputSale.id);
  },

  next(userId){
    if (this.getList().length == 0){
      Err.thrw(Const.none_sale_founded, userId);
    }

    //Get the next sale from list
    var sale = getAssertedList()[0];
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

  clear(){
    var now = new Date().getTime();

    if ((global.staticPickingList.length <= 50) || (global.lastClear + 3600000) < now){
      global.lastClear = now;
      global.staticPickingList = [];
      History.job('Atualização de Picking', 'Iniciando atualização da lista de picking', 'Eccosys');
    }else{
      History.job('Atualização de Picking', 'Tentativa de atualização de lista de picking muito frequente.\n Tentar novamente em 1 hora.', 'Eccosys');
    }
  }
};



function getAssertedList(){
  var list = global.staticPickingList;
  list = TransportLaws.assert(list);
  list = UfLaws.assert(list);
  list = BlockedLaws.assert(list);

  return list;
}


function checkIsInDevMode(){
  var maxSalesOnDevMove = 10;
  //If this Env Var is not defined, it's on development mode
  //Not necessary to load all sales for tests porpouse
  if (!process.env.NODE_ENV){
    if (global.staticPickingList.length > maxSalesOnDevMove){
      global.staticPickingList.splice(maxSalesOnDevMove);
    }
  }
}
