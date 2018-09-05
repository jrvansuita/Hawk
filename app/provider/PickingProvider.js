const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const PendingLaws = require('../laws/pending-laws.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');


global.transportList = {};

//Nexts sales to pick
global.staticPickingList = [];
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
      if (InprogressLaws.checkUserInProgress(userId)) {
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
      console.log(e);
      throw "Nenhum pedido encontrado";
    }
  },

  endPicking(userId, callback) {
    InprogressLaws.endPicking(userId, (sale)=>{
      //Done picking
      global.staticDonePicking.push(sale);
      callback("end-picking-" + sale.numeroPedido);
    });
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
    return InprogressLaws.object();
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

      InprogressLaws.remove(sale.numeroPedido);

      callback();
    });
  },

  pendingStatus(pending, callback){
    PendingLaws.incrementStatus(pending, callback);
  },

  restartPendingSale(pending, loggerdUser, callback){
    var user = loggerdUser;

    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {
      PendingLaws.remove(pending.number);

      callLoadSaleItems(pending.sale, function(sale, items){
        sale.doNotCount = true;
        InprogressLaws.startPicking(sale, user.id);
        callback(getPrintUrl(sale));
      });
    }
  },

  restartDoneSale(user, doneSale, callback){
    var sale = global.staticDonePicking.filter(function(i){
      return i.numeroPedido == doneSale;
    })[0];



    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {

      callLoadSaleItems(sale, function(){
        InprogressLaws.startPicking(sale, user.id);
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
  return assertPickingList(global.staticPickingList)[0];
}


global.pickingPrintUrl =  "https://" + process.env.ECCOSYS_HOST + "/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N&idsVendas=";

function buildResult(userId) {
  //Get the next sale from list
  var sale = getNextSale();
  removeFromPickingList(sale);

  InprogressLaws.startPicking(sale, userId, true);


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

  var blocks = BlockedLaws.getAllSales();

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
    var inprogress = InprogressLaws.getAllSales();
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
