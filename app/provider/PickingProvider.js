const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const Pending = require('../bean/pending.js');
const BlockedSale = require('../bean/blocked-sale.js');
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
//All Blocked Sales wich can't be picking now
global.staticBlockedSales = [];

var previewCount = 6;
const unknow = 'Retirada';
var selectedTransp;


module.exports = {

  init(selected, onFinished) {
    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {

      loadAllPendingSales(()=>{
        loadAllBlockedSales(()=>{

          EccosysCalls.getPickingSales((data) => {
            try{
              global.staticPickingList = JSON.parse(data);
              removePendingSalesFromPickingSalesList();
              handleBlockedSales();
              handleAllDonePickingSales();
              checkIsInDevMode();

              if (areThereSalesToLoadItems()){
                loadSaleItems(0, onFinished);
              }else{
                onFinished();
              }

            }catch(e){
              onFinished();
              console.log(e);
            }
          });
        });
      });
    } else {
      onFinished();
    }
  },

  onPending(callback){
    if (global.staticPendingSales.length == 0){
      loadAllPendingSales(()=>{
        callback();
      });
    }else{
      callback();
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
    try{
      if (global.staticPickingList.length == 0) {
        throw new Error();
      } else {
        callback(buildResult(userId));
      }
    }catch(e){
      throw "Mais nenhum pedido no array de picking";
    }
  },

  endPicking(userId, callback) {
    var sale = global.inprogressPicking[userId];
    delete global.inprogressPicking[userId];
    sale.end = new Date();

    var secDif = (sale.end.getTime() - sale.begin.getTime()) / 1000;
    var totalItems = parseInt(sale.itemsQuantity);

    var day = Day.picking(userId, Dat.today(), secDif, totalItems);

    //Done picking
    global.staticDonePicking.push(sale);

    console.log('[Fechou] picking ' + UsersProvider.get(userId).name  + ' - ' + sale.numeroPedido);

    if(sale.doNotCount){
      callback("end-picking-" + sale.numeroPedido);
    }else{
      Day.sync(day, (err, doc) => {
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


  blockedPickings(){
    return global.staticBlockedSales;
  },

  storePendingSale(sale, local, callback){
    sale = removeUnpendingItems(sale);

    var pending = new Pending(sale.numeroPedido, sale, local);

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
    pending.status = 1;
    pending.updateDate = new Date();
    Pending.upsert(Pending.getKeyQuery(pending.number), pending, function(err, doc){
      updatePendingSale(pending);
      callback(null, pending);
    });
  },

  solvedPendingSale(pending, callback){
    pending.status = 2;
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

      callLoadSaleItems(pending.sale, function(sale, items){
        sale.doNotCount = true;
        initSalePicking(sale, pending.sale.pickUser.id);
        callback(getPrintUrl(sale));
      });
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
  },


  toggleBlockedSale(saleNumber, user, callback){
    var found = false;

    global.staticBlockedSales.forEach((blocked, index, array)=>{
      if (!found && blocked.number == saleNumber){

        if (blocked.sale){
          global.staticPickingList.push(blocked.sale);
        }

        array.splice(index,1);
        found = true;
        blocked.remove();
        callback();
      }
    });

    if (!found){
      var blockedSale = new BlockedSale(saleNumber, user.id, new Date());
      blockedSale.upsert(()=>{
        global.staticBlockedSales.push(blockedSale);
        handleBlockedSales(saleNumber);
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
  initSalePicking(sale, userId, true);
  console.log('[Abriu] picking ' + UsersProvider.get(userId).name  + ' - ' + sale.numeroPedido);
  return getPrintUrl(sale);
}

function getPrintUrl(sale){
  return global.pickingPrintUrl + sale.id;
}

function areThereSalesToLoadItems(){
  return global.staticPickingList.length > 0;
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
    }
    //No Sales to pick
    else if (currentLength == index){
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

function initSalePicking(sale, userId, addPrintTime){
  var begin = new Date();

  if (addPrintTime){
    begin.setSeconds(begin.getSeconds() + 10);
  }

  sale.begin = begin;
  sale.end = null;
  sale.pickUser = UsersProvider.get(userId);
  global.inprogressPicking[userId] = sale;
}

function loadAllPendingSales(callback){
  Pending.findAll(function(err, all){

    all.sort(function(a, b) {
      return a.status < b.status ? 1 : a.status > b.status ? -1 : 0;
    });

    global.staticPendingSales = all;
    callback();
  });
}

function loadAllBlockedSales(callback){
  BlockedSale.findAll(function(err, all){
    global.staticBlockedSales = all;
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


function handleBlockedSales(forThisSale){
  //Remove and save the sale blocked
  global.staticBlockedSales.forEach((blocked)=>{

    blocked.user = UsersProvider.get(blocked.userId);

    if (forThisSale == undefined || forThisSale == blocked.number){
      global.staticPickingList.forEach((sale, index, array)=>{
        if (blocked.number == sale.numeroPedido){
          blocked.sale = sale;
          array.splice(index, 1);
        }
      });
    }
  });
}

//pickingRealizado = N -> All Sales to pick
//pickingRealizado = A -> Picking done
//pickingRealizado = S -> Invoice done
function handleAllDonePickingSales(){

  //Todas as Sales com picking realizado, vão para o array staticDonePicking
  global.staticDonePicking = global.staticPickingList.filter(function(i){
    return i.pickingRealizado != "N";
  });

  //Todas as Sales que não foi feito picking, ficam no array staticPickingList
  global.staticPickingList = global.staticPickingList.filter(function(i){
    return i.pickingRealizado == "N";
  });

  //Qualquer Picking em andamento, não conta para o picking realizado
  //Super importante pra quando terminou todos os pickings e volta algum de pendencia ou dos separados
  if (global.staticPickingList == 0){
    var inprogress = JSON.stringify(global.inprogressPicking);
    global.staticDonePicking = global.staticDonePicking.filter(function(i){
      return !inprogress.includes(i.numeroPedido);
    });
  }
}


function updatePendingSale(pending){
  global.staticPendingSales = global.staticPendingSales.map(function(i) { return i.sale.numeroPedido == pending.sale.numeroPedido ? pending : i; });
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


function removeUnpendingItems(sale){
  sale.items = sale.items.filter(function (item){
    return item.pending !== undefined && item.pending.toString() == "true";
  });
  return sale;
}
