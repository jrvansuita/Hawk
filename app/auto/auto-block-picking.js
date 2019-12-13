const SaleLoader = require('../loader/sale-loader.js');
const BlockHandler = require('../handler/block-handler.js');
const User = require('../bean/user.js');

module.exports= class AutoBlockPicking {

  constructor(sales){
    this.sales = sales;
  }

  _hasToBlock(product){
    var stock = product._Estoque;
    var hasToBlock = false;

    if (stock){
      var local = product.localizacao;

      var reasonStock = stock.estoqueReal <=3 && stock.estoqueDisponivel < 0;
      var reasonLocal = !local || local.length == 0;

      hasToBlock =  reasonStock || reasonLocal;

    }

    return hasToBlock;
  }

  onCheckStock(sale, products, index, onTerminate){
    if (products[index]){
      var product = products[index];

      index++;

      var next = ()=>{
        this.onCheckStock(sale, products, index, onTerminate);
      };

      if (this._hasToBlock(product)){

        var isBlocked = BlockHandler.get(product.codigo);

        if (!isBlocked){
          console.log('----[AutoBlock]---- ');
          BlockHandler.store(product.codigo, new User(404, 'Sistema'), '994', ()=>{
            next();
          });
        }else{
          next();
        }
      }else{
        next();
      }
    }else{
      onTerminate();
    }
  }

  onSale(sales, index){
    if (index < sales.length){
      var sale = this.sales[index];

      new SaleLoader(sale).loadProducts((products)=>{
        this.onCheckStock(sale, products, 0, ()=>{
          index++;
          this.onSale(sales, index);
        });
      }).run();
    }
  }

  run(){
    this.onSale(this.sales, 0);
  }

};
