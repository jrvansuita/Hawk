const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const PendingLaws = require('../laws/pending-laws.js');
const BlockedLaws = require('../laws/blocked-laws.js');


global.transportList = {};

//Nexts sales to pick
global.staticPickingList = [];
//Current picking
global.inprogressPicking = {};
//All ready picking sales
global.staticDonePicking = [];

var previewCount = 6;
const unknow = 'Retirada';
var selectedTransp;


module.exports = {

  init(selected, onFinished) {
    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {

      PendingLaws.loadAll(true, ()=>{
        BlockedLaws.load(()=>{

          EccosysCalls.getPickingSales((data) => {
            try{
              global.staticPickingList = JSON.parse(data);
              removePendingSalesFromPickingSalesList();
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
    PendingLaws.loadAll(false, callback);
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
      throw "Nenhum pedido encontrado";
    }
  },

  endPicking(userId, callback) {
    var sale = global.inprogressPicking[userId];
    delete global.inprogressPicking[userId];
    sale.end = new Date();

    var secDif = (sale.end.getTime() - sale.begin.getTime()) / 1000;
    var totalItems = parseInt(sale.itemsQuantity);

    var day = Day.picking(userId, Dat.today(), totalItems, secDif);

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

  getPickingSales(){
    return assertPickingList(global.staticPickingList);
  },

  upcomingSales() {
    return assertPickingList(global.staticPickingList).slice(0, previewCount);
  },

  remainingSales() {
    return assertPickingList(global.staticPickingList).length;
  },


  inprogressPicking() {
    return global.inprogressPicking;
  },

  pendingSales() {
    return PendingLaws.list();
  },

  donePickings(){
    return global.staticDonePicking;
  },


  blockedPickings(){
    return BlockedLaws.list();
  },

  storePendingSale(sale, local, callback){
    PendingLaws.store(sale, local, ()=>{
      //Remove From picking List
      global.staticPickingList = global.staticPickingList.filter((i)=>{
        return i.numeroPedido != sale.numeroPedido;
      });

      //Remove from inprogress sales
      for (var key in global.inprogressPicking) {
        if (global.inprogressPicking.hasOwnProperty(key)) {
          if (global.inprogressPicking[key].numeroPedido === sale.numeroPedido){
            delete global.inprogressPicking[key];
          }
        }
      }

      callback();
    });
  },

  pendingStatus(pending, callback){
    PendingLaws.incrementStatus(pending, callback);
  },

  restartPendingSale(pending, loggerdUser, callback){
    var user = loggerdUser;

    if (global.inprogressPicking[user.id] != undefined) {
      throw user.id + ' já tem um pedido em processo de picking.';
    }else{
      PendingLaws.remove(pending.number);

      callLoadSaleItems(pending.sale, function(sale, items){
        sale.doNotCount = true;
        initSalePicking(sale, user.id);
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
    BlockedLaws.toggleBlock(saleNumber, user, callback);
  }
};


function getNextSale(){
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


function assertPickingList(saleList){
  var resultList = saleList;

  if (selectedTransp){
    if (saleList.length > 0) {
      resultList = resultList.filter(sale =>{
        return Str.defStr(sale.transportador,unknow).includes(selectedTransp);
      });
    }
  }

  var blocks = BlockedLaws.getAllBlocks();

  if (blocks){
    resultList = resultList.filter(sale =>{
      return !blocks.includes(sale.numeroPedido);
    });
  }

  return resultList;
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


function removePendingSalesFromPickingSalesList(){
  global.staticPickingList = global.staticPickingList.filter(function(i){
    return !PendingLaws.list().some(function(j){
      return j.number == i.numeroPedido;
    });
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
