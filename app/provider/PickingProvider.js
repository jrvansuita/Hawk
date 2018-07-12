const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const Pending = require('../bean/pending.js');
const PendingHandler = require('../handler/pending-handler.js');


global.transportList = {};

//Nexts sales to pick
global.staticPickingList = [];
//Current picking
global.inprogressPicking = {};
//All sales on pending
global.staticPendingSales = [];
//All ready picking sales
global.staticDonePicking = [];

var previewCount = 6;
const unknow = 'Retirada';
var selectedTransp;


module.exports = {

  init(selected, onFinished) {
    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {
      loadAllPendingSales(()=>{
        EccosysCalls.getPickingSales((data) => {
          try{
            global.staticPickingList = JSON.parse(data);
            removePendingSalesFromPickingSalesList();
            handleAllDonePickingSales();
            checkIsInDevMode();
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

    //Done picking
    global.staticDonePicking.push(sale);

    if(sale.doNotCount){
      callback("end-picking-" + sale.numeroPedido);
    }else{
      Day.upsert(day.getPKQuery(), {
        $inc: {
          count: secDif,
          total: sale.itemsQuantity
        }
      }, (err, doc) => {
        callback("end-picking-" + sale.numeroPedido);
      });
    }
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

  donePickings(){
    return global.staticDonePicking;
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

  solvingPendingSale(pending, callback){
    if (pending.sendEmail == true || pending.sendEmail.toString() == "true"){
      var _self = this;
      PendingHandler.sendEmail(pending, function(err, emailId){
        if (err){
          callback(err, null);
        }else{
          _self._solvingPendingSaleInternal(pending, callback);
        }
      });
    }else{
      this._solvingPendingSaleInternal(pending, callback);
    }
  },

  _solvingPendingSaleInternal(pending, callback){
    pending.solving = true;
    pending.updateDate = new Date();
    Pending.upsert(Pending.getKeyQuery(pending.number), pending, function(err, doc){
      updatePendingSale(pending);
      callback(null, pending);
    });
  },

  solvedPendingSale(pending, callback){
    pending.solved = true;
    delete pending.solving;
    pending.updateDate = new Date();
    Pending.upsert(Pending.getKeyQuery(pending.number),pending, function(err, doc){
      updatePendingSale(pending);
      callback(pending);
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
      delete pending.solving;
      delete pending.updateDate;
      delete pending.sale.pending;

      pending.sale.doNotCount = true;

      initSalePicking(pending.sale, pending.sale.pickUser.id);
      callback(getPrintUrl(pending.sale));
    }
  },

  restartDoneSale(user, doneSale, callback){
    var sale = global.staticDonePicking.filter(function(i){
      return i.numeroPedido == doneSale;
    })[0];

    if (global.inprogressPicking[user.id] != undefined) {
      throw 'Você já tem um pedido em processo de picking.';
    }else{
      callLoadSaleItems(sale, function(){
        initSalePicking(sale, user.id);
        //Remove from Done List
        global.staticDonePicking = global.staticDonePicking.filter(function(i){
          return i.numeroPedido !== doneSale;
        });

        callback();

      });
    }
  }
};


function getNextSale() {
  return assertTransport(global.staticPickingList)[0];
}


global.pickingPrintUrl =  "https://" + process.env.ECCOSYS_HOST + "/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N&idsVendas=";

function buildResult(userId) {
  //Get the next sale from list
  var sale = getNextSale();
  removeFromPickingList(sale);
  initSalePicking(sale, userId);
  return getPrintUrl(sale);
}

function getPrintUrl(sale){
  return global.pickingPrintUrl + sale.id;
}


function loadSaleItems(index, callback) {
  var sale = global.staticPickingList[index];

  callLoadSaleItems(sale, function(sale, items){
    var currentLength = global.staticPickingList.length;
    global.staticPickingList[index] = sale;

    index++;
    console.log(index + '/' + (currentLength));

    if (index < currentLength) {
      loadSaleItems(index, callback);

      if (index == previewCount) {
        callback();
      }
    } /*else if (index == currentLength) {
      if (currentLength <= previewCount){
      callback();
    }
  }*/
  //No Sales to pick
  else if (currentLength == 0){
    callback();
  }
});
}

function callLoadSaleItems(sale, callback){
  EccosysCalls.getSaleItems(sale.numeroPedido, (data) => {
    var items = JSON.parse(data);
    var saleResult = loadSingleAttrs(sale, items);
    callback(saleResult, items);
  });
}

function loadSingleAttrs(sale, items){
  var transp = Str.defStr(sale.transportador, unknow).split(' ')[0];

  global.transportList[transp] = transp;
  sale.transport = transp;
  sale.items = items;
  sale.itemsQuantity = items.reduce(function(a, b) {
    return a + parseFloat(b.quantidade);
  }, 0);

  return sale;
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

//pickingRealizado = N -> All Sales to pick
//pickingRealizado = A -> Picking done
//pickingRealizado = S -> Invoice done
function handleAllDonePickingSales(){
  global.staticDonePicking = global.staticPickingList.filter(function(i){
    return i.pickingRealizado != "N";
  });

  global.staticPickingList = global.staticPickingList.filter(function(i){
    return i.pickingRealizado == "N";
  });
}

function updatePendingSale(pending){
  global.staticPendingSales = global.staticPendingSales.map(function(i) { return i.sale.numeroPedido == pending.sale.numeroPedido ? pending : i; });
}


function checkIsInDevMode(){
  //If this Env Var is not defined, it's on development mode
  //Not necessary to load all sales for tests porpouse
  if (!process.env.NODE_ENV){
    if (global.staticPickingList.length > 10){
      global.staticPickingList.splice(10);
    }
  }
}
