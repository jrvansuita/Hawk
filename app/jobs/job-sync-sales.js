const Job = require('../jobs/controller/job.js')
const History = require('../bean/history.js')
const SaleKeeper = require('../loader/sale-keeper.js')
const EccosysProvider = require('../eccosys/eccosys-provider.js')

module.exports = class JobSyncSales extends Job {
  getName () {
    return 'Sincronização de Pedidos'
  }

  handleEach (saleRow, next) {
    new SaleKeeper(saleRow.numeroPedido)
      .setOnError((err) => {
        console.log(err)
        this.onError(err)
      })
      .save(next)
  }

  handlePage (page, nextPageCallback) {
    var runEach = () => {
      if (page.length) {
        this.handleEach(page[0], () => {
          page.shift()
          runEach()
        })
      } else {
        nextPageCallback()
      }
    }

    runEach()
  }

  doWork () {
    return new Promise((resolve, reject) => {
      new EccosysProvider(true)
        .setOnError((err) => {
          reject(err)
        })
        .pageCount(100)
      // .dates(Dat.yesterday(), Dat.yesterday())
        .dates(new Date('04-30-2020'), new Date('04-30-2020'), 'dataFaturamento', true)
        .sales()
        .pagging()
        .each((salePage, nextPage) => {
          console.log('Page count:' + salePage.length)
          this.handlePage(salePage, nextPage)
        }).end(() => {
          resolve()
        })
    })
  }
}
