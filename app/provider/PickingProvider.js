var EccosysCalls = require('../eccosys/eccosys-calls.js');


global.staticPickingList = [];

module.exports = {


  initNext(userId, callback) {
    if (global.staticPickingList.length == 0) {
      EccosysCalls.getPickingSales((data) => {
        global.staticPickingList = JSON.parse(data);
        callback(buildResult());
      });
    } else {
      callback(buildResult());
    }
  }






};



function getNextSale() {
  return global.staticPickingList[0];
}


var printUrl = "https://boutiqueinfantil.eccosys.com.br/relatorios/picking.impressao.romaneio.php?imprimeAbertos=N";

function buildResult() {
  var sale = getNextSale();
  return printUrl + "&idsVendas=" + sale.id;
}