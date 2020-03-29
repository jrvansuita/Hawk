const Job = require('../jobs/controller/job.js');
const History = require('../bean/history.js');
const Sale = require('../bean/sale.js');
const SaleLoader = require('../loader/sale-loader.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = class JobSyncSales extends Job{

  getName(){
    return 'Sincronização de Pedidos';
  }

  handleEach(saleRow, next){
    new SaleLoader(saleRow.numeroPedido)
    //.loadClient()
    .loadItems()
    .loadItemsDeepAttrs(null, (item, product) => {
      item.cost = product.precoCusto;
      item.brand = product.Marca;
      item.gender = product.Genero;
    })
    .setOnError((err) => {
      this.onError(err);
    })
    .run((sale) => {
      console.log('Loades sale ' + sale.numeroPedido);
      Sale.from(sale).upsert(next);
    });
  }

  handlePage(page, nextPageCallback){
    var runEach = () => {
      if (page.length){
        this.handleEach(page[0], () => {
          page.shift();
          runEach();
        });
      }else{
        nexPageCallback();
      }
    }

    runEach();
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      new EccosysProvider(false)
      .setOnError((err) => {
        reject(err);
      })
      .pageCount(1000)
      //.dates(Dat.yesterday(), Dat.yesterday())
      .dates(Dat.rollDay(null, -2), Dat.yesterday())
      .doneSales()
      .pagging()
      .each((salePage, nextPage)=>{
        this.handlePage(salePage, nextPage);
      }).end(()=>{
        resolve();
      });
    });
  }


};
