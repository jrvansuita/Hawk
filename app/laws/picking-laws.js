const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const History = require('../bean/history.js');
const Err = require('../error/error.js');

//Nexts sales to pick
global.staticPickingList = [];
global.selectedMoreOptions = undefined;

module.exports = {

  set(list){
    global.staticPickingList = list;
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

  getSaleIndex(saleNumber){
    return global.staticPickingList.findIndex(sale => sale.numeroPedido == saleNumber);
  },

  //Can't use .filter, Can't create another object
  remove(inputSale){
    global.staticPickingList.splice(this.getSaleIndex(inputSale.numeroPedido),1);
  },

  next(userId){
    if (this.getList().length == 0){
      Err.thrw(Const.none_sale_founded, userId);
    }

    var pickingList = getAssertedList();

    if (pickingList.length == 0){
      Err.thrw(Const.none_sale_founded_asserted, userId);
    }

    //Get the next sale from list
    var sale = pickingList[0];

    this.remove(sale);
    return sale;
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
    //Limpa a lista de picking
    this.set([]);
    //Limpa a lista de pedidos bloqueados
    global.staticBlockedSales = [];
    History.job(Const.picking_update, Const.starting_picking_update, 'Eccosys', userId);
  },

  getFiltersObject(){
    return getFiltersObject();
  },

  getSelectedFilters(){
    return global.selectedMoreOptions || getDefaultFiltersObject();
  },

  setFilters(options){
    global.selectedMoreOptions = options;
  }
};



function getAssertedList(){
  var list = global.staticPickingList;
  list = TransportLaws.assert(list);
  list = UfLaws.assert(list);

  var filter = getFilterValues();
  if (filter){

    if (filter.firstPurchase){

    }

  }

  return list;
}


function checkIsInDevMode(){
  var maxSalesOnDevMove = Params.devMaxSalesOnPicking() || 12;
  //If this Env Var is not defined, it's on development mode
  //Not necessary to load all sales for tests porpouse
  if (!process.env.NODE_ENV){
    if (global.staticPickingList.length > maxSalesOnDevMove){
      global.staticPickingList.splice(maxSalesOnDevMove);
    }
  }
}

function getFiltersObject(){
  return {
    firstPurchase : 'Primeira Compra',
    creditCard: 'Cartão de Crédito',
    boleto : 'Boleto'
  }
}

function getDefaultFiltersObject(){
  return "creditCard|boleto";
}

function getFilterValues(){
  if (global.selectedMoreOptions){
    var result = global.selectedMoreOptions;

    Object.keys(result).map((key) => {
      result[key] = options.includes(key)
    });

    return result;
  }
}
