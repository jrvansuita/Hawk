const DoneLaws = require('../laws/done-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const SaleShell = require('../print/sale-shell.js');
const UsersProvider = require('../provider/UsersProvider.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PickingLaws = require('../laws/picking-laws.js');

module.exports = class PickingSalePrint{

  constructor(userId, saleNumber){
    this.user = UsersProvider.get(userId);
    this.saleNumber = saleNumber;
  }

  setOnFinish(callback){
    this.onFinish = callback;
    return this;
  }

  _loadFromProgressOrDone(){
    var sale = InprogressLaws.get(this.saleNumber) || DoneLaws.get(this.saleNumber);

    loadSaleForPrint(sale || saleNumber, this.user, (shell)=>{
      this._fisnish(shell);
    });
  }

  load(){
    var shell = getShellSaleFromPool(this.saleNumber);
    if (shell){
      this._fisnish(shell);
      createAndHandlePrintPool(this.user);
    }else{
      this._loadFromProgressOrDone();
      createAndHandlePrintPool(this.user);
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

function createAndHandlePrintPool(user){
  var poolSize = 3;

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

  loadShellsFromSales(user);
}

function loadShellsFromSales(user){
  global.shellsPrintPool.forEach((item, index)=>{
    if (!(item instanceof SaleShell)){
      loadSaleForPrint(item, user, (shell)=>{
        global.shellsPrintPool[index] = shell;
      });
    }
  });
}

//Carrega toda a Sale e cria uma estrutura chamada de
//shell para enviar ao layout para montar a impressao
function loadSaleForPrint(sale, user, callback){
  new SaleLoader(sale)
  .loadItems()
  .loadClient()
  .loadProducts((products, sale)=>{
    if (callback){
      var shell = new SaleShell(sale, user);

      shell.parseItems(sale, products);
      shell.sortByLocal();

      callback(shell);
    }
  }).run();
}


//Marca no Eccosys que o pedido já foi impresso
function markAsPrinted(saleNumber){
  EccosysCalls.getSale(saleNumber, (sale)=>{
    if (sale.pickingRealizado == "N"){

      var body = {
        situacao: sale.situacao,
        numeroPedido: saleNumber,
        pickingRealizado: "A"
      };

      EccosysCalls.updateSale([body], ()=>{});
    }
  });
}
