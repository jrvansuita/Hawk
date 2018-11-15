const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const User = require('../bean/user.js');

module.exports= class AutoBlockPicking {

  constructor(){
    this.sales = PickingLaws.getFullList();
  }

  onProduct(products, index, onTerminate){
    if (index < products.length){
      var product = products[index];

console.log('Testou ' + product.codig);

      if (product._Estoque.estoqueDisponivel < 1){
        ///nao pode bloquead o que já está bloqueado
        BlockedLaws.toggleBlock(product.codigo, new User(404), '994', ()=>{
          index++;
          onProduct(products, index);
        });
      }
    }else{
      onTerminate();
    }
  }

  onSale(sales, index){
    new SaleLoader(this.sales[index]).loadProducts((products)=>{
      console.log('Carregou os produtos ' + this.sales[index].numeroPedido);
      onProduct(products, 0, ()=>{
        index++;
        onSale(sales, index);
      });
    }).run();

  }

  run(){
    onSale(this.sales, 0);
  }

};
