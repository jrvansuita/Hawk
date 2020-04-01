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
      console.log('JobSales - ' + sale.numeroPedido + ' - ' + Dat.format(new Date(sale.data)));
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
        nextPageCallback();
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
      .dates(new Date('03-13-2019'), Dat.today())
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
