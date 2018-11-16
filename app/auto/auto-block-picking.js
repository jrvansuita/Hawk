const SaleLoader = require('../loader/sale-loader.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const User = require('../bean/user.js');

module.exports= class AutoBlockPicking {

  constructor(sales){
    this.sales = sales;
  }

  onCheckStock(products, index, onTerminate){
    if (index < products.length){
      var product = products[index];

      index++;

      if (product._Estoque.estoqueDisponivel < 0){
        var isBlocked = BlockedLaws.get(product.codigo);

        if (!isBlocked){
          BlockedLaws.toggleBlock(product.codigo, new User(404, 'Sistema'), '994', ()=>{
            console.log('Bloqueio ' + product.codigo + ' estoque ' + product._Estoque.estoqueDisponivel);
            this.onCheckStock(products, index, onTerminate);
          });
        }else{
          this.onCheckStock(products, index, onTerminate);
        }
      }else{
        this.onCheckStock(products, index, onTerminate);
      }
    }else{
      onTerminate();
    }
  }

  onSale(sales, index){
    if (index < sales.length){
      new SaleLoader(this.sales[index]).loadProducts((products)=>{
        this.onCheckStock(products, 0, ()=>{
          index++;
          this.onSale(sales, index);
        });
      }).run();
    }
  }

  run(){
    if (process.env.NODE_ENV){
      this.onSale(this.sales, 0);
    }
  }

};
