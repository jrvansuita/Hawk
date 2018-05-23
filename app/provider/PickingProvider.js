var EccosysCalls = require('../eccosys/eccosys-calls.js');
var UsersProvider = require('../provider/UsersProvider.js');
var Pick = require('../bean/pick.js');


global.staticPickingList = [];
global.inprogressPicking = {};

var previewCount = 6;

module.exports = {

  init(onFinished) {
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

  nextSale(userId, callback) {
    if (UsersProvider.checkUserExists(userId))
      if (global.staticPickingList.length == 0) {
        throw "Mais nenhum pedido no array de picking";
      } else {
        callback(buildResult(userId));
      }
  },

  upcomingSales() {
    return global.staticPickingList.slice(0, previewCount);
  },

  remainingSales() {
    return global.staticPickingList.length;
  },

  inprogressPicking() {
    return global.inprogressPicking;
  }






};


function getNextSale() {
  return global.staticPickingList[0];
}


var printUrl = "https://boutiqueinfantil.eccosys.com.br/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N";

function buildResult(userId) {
  var sale = getNextSale();
  var pick = new Pick(sale.numeroPedido, userId, new Date(), null, sale.itemsQuantity);
  global.inprogressPicking[userId] = pick;
  return printUrl + "&idsVendas=" + sale.id;
}


function loadSaleItems(sales, index, preview, callback) {
  EccosysCalls.getSaleItems(sales[index].numeroPedido, (data) => {
    var items = JSON.parse(data);

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