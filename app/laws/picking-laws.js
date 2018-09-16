const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const BlockedLaws = require('../laws/blocked-laws.js');


//Nexts sales to pick
global.staticPickingList = [];
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

  remove(inputSale){
    global.staticPickingList = global.staticPickingList.filter(sale => sale.id != inputSale.id);
  },

  next(userId){
    Util.throwIfEmpty(this.getList(), Const.none_sale_founded);

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
  var maxSalesOnDevMove = 6;
  //If this Env Var is not defined, it's on development mode
  //Not necessary to load all sales for tests porpouse
  if (!process.env.NODE_ENV){
    if (global.staticPickingList.length > maxSalesOnDevMove){
      global.staticPickingList.splice(maxSalesOnDevMove);
    }
  }
}
