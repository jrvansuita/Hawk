const Sale = require('../bean/sale.js');
const SaleLoader = require('./sale-loader.js');
const SaleStock = require('../bean/sale-stock.js');
const Product = require('../bean/product.js');

module.exports = class SaleKeeper{
  constructor(saleNumber){
    this.saleNumber = saleNumber;
  }

  setOnError(onError){
    this.onError = onError;
    return this;
  }

  save(callback){
    this.load((sale) => {
      this.store(sale, callback);
    })
  }

  requestClient(){
    this.loadClient = true;
    return this;
  }

  storeStock(item, callback){
    Product.get(item.codigo, (product)=>{
      console.log('Sale Keep Item - ' + item.codigo);
      SaleStock.from(item, product).save(callback);
    });
  }

  store(sale, onTerminate){
    console.log('Sale Keep - ' + sale.numeroPedido + ' - ' + Dat.format(new Date(sale.data)));
    Sale.from(sale).upsert(() => {

      var index = 0;
      var runSaleItems = () => {
        if (sale.items[index]){
          this.storeStock(sale.items[index], runSaleItems);
          index++;
        }else{
          if (onTerminate) onTerminate(sale);
        }
      }
      runSaleItems();
    });
  }


  load(callback){
    var loader = new SaleLoader(this.saleNumber);

    if (this.loadClient){
      loader.loadClient();
    }

    loader.loadItems()
    .loadItemsDeepAttrs(null, (item, product) => {
      item.cost = product.precoCusto;
      item.gender = product.Genero;
      item.season = product.Estacao;
      item.category = product.Departamento;
      item.manufacturer = product.Fabricante;
      item.brand = product.Marca;
      //item.stock = product._Estoque.estoqueReal;
    })
    .setOnError(this.onError)
    .run((sale) => {
      if (callback){
        callback(sale);
      }
    });
  }

}
