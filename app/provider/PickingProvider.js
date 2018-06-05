const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');


global.staticPickingList = [];
global.inprogressPicking = {};
global.transportList = {};

var previewCount = 6;
const unknow = 'Indefinido';
var selectedTransp;
var maxPickingSales;


module.exports = {

  init(selected, onFinished) {
    maxPickingSales = 10;

    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {
      EccosysCalls.getPickingSales((data) => {
        global.staticPickingList = JSON.parse(data);
        loadSaleItems(0, onFinished);
      });
    } else {
      onFinished();
    }
  },

  getTransportList() {
    return global.transportList;
  },

  handle(userId, callback) {
      if (UsersProvider.checkUserExists(userId)){
          //Convert from access or id
          userId = UsersProvider.get(userId).id;
        if (global.inprogressPicking[userId] != undefined) {
          //In progress picking
          this.endPicking(userId, callback);
        } else {
          this.nextSale(userId, callback);
        }
      }
  },

  nextSale(userId, callback) {
    if (global.staticPickingList.length == 0) {
      console.log(global.staticPickingList.length);
      throw "Mais nenhum pedido no array de picking";
    } else {
      callback(buildResult(userId));
    }
  },

  endPicking(userId, callback) {
    var sale = global.inprogressPicking[userId];
    delete global.inprogressPicking[userId];
    sale.end = new Date();
    var day = Day.picking(userId, Dat.today());

    var secDif = (sale.end.getTime() - sale.begin.getTime()) / 1000;

    Day.upsert(day.getPKQuery(), {
      $inc: {
        count: secDif,
        total: sale.itemsQuantity
      }
    }, (err, doc) => {
      callback("end-picking-" + sale.numeroPedido);
    });
  },

  upcomingSales() {
    return assertTransport(global.staticPickingList).slice(0, previewCount);
  },

  remainingSales() {
    return assertTransport(global.staticPickingList).length;
  },

  inprogressPicking() {
    return global.inprogressPicking;
  }






};


function getNextSale() {
  return assertTransport(global.staticPickingList)[0];
}


var printUrl = "https://boutiqueinfantil.eccosys.com.br/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N";

function buildResult(userId) {
  //Get the next sale from list
  var sale = getNextSale();
  removeFromPickingList(sale);
  initSalePicking(sale, userId);
  return printUrl + "&idsVendas=" + sale.id;
}


function loadSaleItems(index, callback) {
  EccosysCalls.getSaleItems(global.staticPickingList[index].numeroPedido, (data) => {
    var items = JSON.parse(data);
    var currentSale = global.staticPickingList[index];
    var currentLength = global.staticPickingList.length;

    var transp = Str.defStr(currentSale.transportador, unknow).split(' ')[0];

    global.transportList[transp] = transp;
    currentSale.transport = transp;
    currentSale.items = items;
    currentSale.itemsQuantity = items.reduce(function(a, b) {
      return a + parseFloat(b.quantidade);
    }, 0);

    global.staticPickingList[index] = currentSale;

    index++;
    console.log(index + '/' + (currentLength));
    maxPickingSales--;
    
    if (index < currentLength && maxPickingSales > 0) {
      loadSaleItems(index, callback);
      if (index == previewCount) {
        callback();
      }
    }
  });
}


function assertTransport(saleList){
  if (selectedTransp){
    if (saleList.length > 0) {
      return saleList.filter(sale =>{
        return Str.defStr(sale.transportador,unknow).includes(selectedTransp);
      });
    }
  }

  return saleList;
}

function removeFromPickingList(inputSale){
  global.staticPickingList = global.staticPickingList.filter(sale => sale.id != inputSale.id);
}

function initSalePicking(sale, userId){
  sale.begin = new Date();
  sale.end = null;
  sale.pickUser = UsersProvider.get(userId);
  global.inprogressPicking[userId] = sale;
}
