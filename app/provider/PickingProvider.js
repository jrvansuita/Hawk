const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const Pending = require('../bean/pending.js');


global.staticPickingList = [];
global.inprogressPicking = {};
global.transportList = {};
global.staticPendingSales = [];

var previewCount = 6;
const unknow = 'Indefinido';
var selectedTransp;
var maxPickingSalesForTest;


module.exports = {

  init(selected, onFinished) {
    maxPickingSalesForTest = 10;

    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {
      loadAllPendingSales(()=>{
        EccosysCalls.getPickingSales((data) => {
          try{
            global.staticPickingList = JSON.parse(data);
            removePendingSalesFromPickingSalesList();
            loadSaleItems(0, onFinished);
          }catch(e){
            onFinished();
            console.log('Erro ao buscar pedidos no eccosys.');
          }
        });
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
  },

  pendingSales() {
    return global.staticPendingSales;
  },

  storePendingSale(sale, callback){
    var pending = new Pending(sale.numeroPedido, sale);

    pending.upsert(()=>{
      //Remove From picking List
      global.staticPickingList = global.staticPickingList.filter((i)=>{
        return i.numeroPedido != sale.numeroPedido;
      });

      //Remove from inprogress sales
      for (var key in global.inprogressPicking) {
        if (global.inprogressPicking.hasOwnProperty(key)) {
          if (global.inprogressPicking[key].numeroPedido === pending.number){
            delete global.inprogressPicking[key];
          }
        }
      }

      //Add new pending sale
      global.staticPendingSales.push(pending);
      callback();
    });
  },

  solvePendingSale(pending, callback){
    pending.solved = true;
    Pending.upsert(Pending.getKeyQuery(pending.number),pending, function(err, doc){
      global.staticPendingSales.filter((i)=>{
        if (i.number == doc.number){
          i.solved = true;
        }
        return true;
      });

      callback();
    });
  },

  restartPendingSale(pending, callback){
    if (global.inprogressPicking[pending.sale.pickUser.id] != undefined) {
      throw pending.sale.pickUser.name + ' já tem um pedido em processo de picking.';
    }else{
      Pending.removeAll(Pending.getKeyQuery(pending.number));
      global.staticPendingSales = global.staticPendingSales.filter((i)=>{
        return i.number != pending.number;
      });

      delete pending.solved;
      delete pending.sale.pending;

      initSalePicking(pending.sale, pending.sale.pickUser.id);
      callback(getPrintUrl(pending.sale));
    }
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
  return getPrintUrl(sale);
}

function getPrintUrl(sale){
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
    maxPickingSalesForTest--;

    if (index < currentLength && maxPickingSalesForTest > 0) {
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

function loadAllPendingSales(callback){
  Pending.findAll(function(err, all){
    global.staticPendingSales = all;
    callback();
  });
}

function removePendingSalesFromPickingSalesList(){
  global.staticPickingList = global.staticPickingList.filter(function(i){
    return !global.staticPendingSales.some(function(j){
      return j.number == i.numeroPedido;
    });
  });
}
