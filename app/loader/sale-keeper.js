const Sale = require('../bean/sale.js');
const SaleLoader = require('./sale-loader.js');

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

  store(sale, callback){
    console.log('Sale Keep - ' + sale.numeroPedido + ' - ' + Dat.format(new Date(sale.data)));
    Sale.from(sale).upsert(() => {
      if (callback){
        callback(sale);
      }
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
      //item.brand = product.Marca;
      //item.gender = product.Genero;
    })
    .setOnError(this.onError)
    .run((sale) => {
      if (callback){
        callback(sale);
      }
    });
  }

}
