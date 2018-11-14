const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockedLaws = require('../laws/blocked-laws.js');
var User = require('../bean/user.js');

module.exports= class AutoBlockPicking {

  constructor(){

  }

  onProduct(product){
    if (product._Estoque.estoqueDisponivel > 0){
      BlockedLaws.toggleBlock(product.codigo, new User(404), 994);
    }
  }

 onSale(sale){
   new SaleLoader(sale).loadProducts((products)=>{
      product.forEach((product)=>{
        if (product._Estoque.estoqueDisponivel > 0){

        }
      });
   }).run();

 }

 run(){

 }

};
