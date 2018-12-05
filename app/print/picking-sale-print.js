const DoneLaws = require('../laws/done-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const SaleShell = require('../print/sale-shell.js');
const UsersProvider = require('../provider/UsersProvider.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports = {

  load(userId, saleNumber, callback){

    var sale = InprogressLaws.get(saleNumber) || DoneLaws.get(saleNumber);
    var user = UsersProvider.get(userId);

    new SaleLoader(sale || saleNumber)
    .loadItems()
    .loadClient()
    .loadProducts((products, sale)=>{
      if (callback){
        var shell = new SaleShell(sale, user);

        shell.parseItems(sale, products);
        shell.sortByLocal();

        callback(shell);
        markAsPrinted(saleNumber);
      }
    })
    .run();
  }


};


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
