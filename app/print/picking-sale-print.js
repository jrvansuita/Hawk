const DoneLaws = require('../laws/done-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const SaleShell = require('../print/sale-shell.js');
var UsersProvider = require('../provider/UsersProvider.js');

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
      }
    })
    .run();
  }


};
