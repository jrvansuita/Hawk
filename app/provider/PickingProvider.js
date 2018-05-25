const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');


global.staticPickingList = [];
global.inprogressPicking = {};
global.transportList = {};

var previewCount = 6;
const unknow = 'Indefinido';
var selectedTransp;


module.exports = {

  init(selected, onFinished) {
    selectedTransp = selected;

    if (global.staticPickingList.length == 0) {
      EccosysCalls.getPickingSales((data) => {

        var sales = JSON.parse(data);
        global.staticPickingList = sales;

        loadSaleItems(sales, 0, (sales) => {
          global.staticPickingList = sales;
          onFinished();
        }, () => {
          global.staticPickingList = sales;
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
    //Check User exists

    if (UsersProvider.checkUserExists(userId))
    if (global.inprogressPicking[userId] != undefined) {
      //In progress picking
      this.endPicking(userId, callback);
    } else {
      this.nextSale(userId, callback);
    }
  },

  nextSale(userId, callback) {
    if (global.staticPickingList.length == 0) {
      console.log();
      throw "Mais nenhum pedido no array de picking";
    } else {
      callback(buildResult(userId));
    }
  },

  endPicking(userId, callback) {
    var sale = global.inprogressPicking[userId];
    delete global.inprogressPicking[userId];
    sale.end = new Date();
    var day = Day.picking(userId, new Date());

    var secDif = (sale.end.getTime() - sale.begin.getTime()) / 1000;
    console.log(secDif);

    Day.upsert(day.getPKQuery(), {
      $inc: {
        count: secDif,
        total: sale.itemsQuantity
      }
    }, (err, doc) => {
      callback("end-picking-" + sale.numeroPedido);
      console.log(doc);
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
  var sale = getNextSale();
  sale.begin = new Date();
  sale.end = null;
  sale.pickUser = UsersProvider.get(userId);
  global.inprogressPicking[userId] = sale;
  global.staticPickingList.splice(0, 1);

  console.log(sale);

  return printUrl + "&idsVendas=" + sale.id;
}


function loadSaleItems(sales, index, preview, callback) {
  EccosysCalls.getSaleItems(sales[index].numeroPedido, (data) => {
    var items = JSON.parse(data);

    var transp = Str.defStr(sales[index].transportador, unknow).split(' ')[0];

    console.log(transp);
    global.transportList[transp] = transp;
    sales[index].transport = transp;
    sales[index].items = items;
    sales[index].itemsQuantity = items.reduce(function(a, b) {
      return a + parseFloat(b.quantidade);
    }, 0);


    index++;

    //console.log(index + '/' + (sales.length));

    if (index < sales.length) {
      loadSaleItems(sales, index, preview, callback);

      if (index == previewCount) {
        preview(sales);
      }
    } else {
      callback(sales);
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
