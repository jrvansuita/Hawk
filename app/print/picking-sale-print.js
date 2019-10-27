const DoneLaws = require('../laws/done-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const SaleShell = require('../print/sale-shell.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const EccosysStorer = require('../eccosys_new/eccosys-storer.js');
const PickingLaws = require('../laws/picking-laws.js');

module.exports = class PickingSalePrint{

  constructor(saleNumber){
    this.saleNumber = saleNumber;
  }

  setOnFinish(callback){
    this.onFinish = callback;
    return this;
  }

  _loadFromProgressOrDone(){
    var sale = InprogressLaws.get(this.saleNumber) || DoneLaws.get(this.saleNumber);

    loadSaleForPrint(sale || this.saleNumber, (shell)=>{
      this._fisnish(shell);
    });
  }

  load(){
    var shell = getShellSaleFromPool(this.saleNumber);
    if (shell){
      this._fisnish(shell);
      createAndHandlePrintPool();
    }else{
      this._loadFromProgressOrDone();
      createAndHandlePrintPool();
    }
  }

  _fisnish(shell){
    if (this.onFinish){
      this.onFinish(shell);
      markAsPrinted(shell.number);
    }
  }


};


function getShellSaleFromPool(saleNumber){
  return global.shellsPrintPool.find((shell)=>{
    return shell.number == saleNumber;
  });
}

global.shellsPrintPool = [];

function createAndHandlePrintPool(){
  var poolSize = Math.trunc((PickingLaws.getList().length * 0.2) / 100);

  poolSize = poolSize < 3 ? 3 : poolSize;

  var nextSales = PickingLaws.getList().slice(0,poolSize);

  nextSales.forEach((sale)=>{
    var found = global.shellsPrintPool.find((shell)=>{
      return sale.numeroPedido == shell.number;
    });

    if (!found){
      global.shellsPrintPool.push(sale);
    }
  });

  global.shellsPrintPool = global.shellsPrintPool.slice(-poolSize);

  loadShellsFromSales();
}

function loadShellsFromSales(){
  global.shellsPrintPool.forEach((item, index)=>{
    if (!(item instanceof SaleShell)){
      loadSaleForPrint(item, (shell)=>{
        global.shellsPrintPool[index] = shell;
      });
    }
  });
}

//Carrega toda a Sale e cria uma estrutura chamada de
//shell para enviar ao layout para montar a impressao
function loadSaleForPrint(sale, callback){
  new SaleLoader(sale)
  .loadItems()
  .loadClient()
  .loadProducts((products, sale)=>{

    if (callback){
      var shell = new SaleShell(sale);

      shell.parseItems(sale, products);
      shell.sortByLocal();

      callback(shell);
    }
  }).run();
}


//Marca no Eccosys que o pedido já foi impresso
function markAsPrinted(saleNumber){
  new EccosysProvider().sale(saleNumber).go((sale)=>{

    if (!sale){
      throw 'Sale not defined ' + saleNumber;
    }


    if (sale && sale.pickingRealizado == "N"){

      var body = {
        situacao: sale.situacao,
        numeroPedido: saleNumber,
        pickingRealizado: "A"
      };

      new EccosysStorer().sale().update([body]).go();
    }
  });
}
