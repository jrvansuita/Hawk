const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const MundiApi = require('../mundipagg/mundi-api.js');
const History = require('../bean/history.js');
const MagentoApi = require('../magento/magento-api.js');


const TAG_ID = 'MH';

module.exports = class JobMundipaggChecker extends Job{

  onInitialize(){
    this.magentoApi = new MagentoApi();
  }

  getName(){
    return 'Sincronização de Pagamentos Mundipagg';
  }

  doWork(){
    return new Promise((resolve, reject)=>{

      this.waitingPaymentSales(() => {
        this.cancelledSales(() => {
          resolve('Done!');
        });
      });

    });
  }

  cancelledSales(onTerminate){
    onTerminate();
  }

  waitingPaymentSales(onTerminate){
    new EccosysProvider()
    .waitingPaymentSales()
    .pagging()
    .each((salesPage, nextPage)=>{
      this.handleSalesPage(salesPage, nextPage);
    }).end(()=>{
      onTerminate();
    });
  }

  handleSalesPage(salesPage, nexPageCallback){
    var runEachSale = () => {
      if (salesPage.length){
        this.handleSale(salesPage[0], () => {
          salesPage.shift();
          runEachSale();
        });
      }else{
        nexPageCallback();
      }
    }

    runEachSale();
  }

  saleChecked(sale){
    var isBoleto = sale.observacaoInterna.includes('mundipagg_boleto');
    var daysDif = Dat.daysDif(new Date(sale.data), new Date()) >= 2

    return isBoleto && daysDif;
  }

  handleSale(sale, nextSale){
    if (this.saleChecked(sale)){
      new MundiApi().sale(sale.numeroDaOrdemDeCompra).go((data) => {

        data = this.getPaymentData(data);

        if (data){
          var expirationDate = new Date(data.ExpirationDate);
          var payDate = data.PaymentDate ? new Date(data.PaymentDate) : undefined;

          //console.log('Expiração: ' + Dat.format(expirationDate) + ' Hoje: ' + Dat.format(new Date()) + ' Dif: ' + Dat.daysDif(expirationDate, new Date()));
          //console.log(data.BoletoTransactionStatus);

          if (data.BoletoTransactionStatus.includes('Paid')){
            console.log('OC: ' + sale.numeroDaOrdemDeCompra + ' Aprovado');
            this.saleWasPay(sale, payDate, expirationDate, nextSale);
          }else{
            if (Dat.daysDif(expirationDate, new Date()) > 1){
              console.log('OC: ' + sale.numeroDaOrdemDeCompra + ' Cancelado');
              this.saleHasOverdue(sale, payDate, expirationDate, nextSale);
            }else{
              console.log('OC: ' + sale.numeroDaOrdemDeCompra + ' Não vencido');
              nextSale();
            }
          }
        }else{
          nextSale();
        }
      });
    }else{
      nextSale();
    }
  }


  getPaymentData(data){
    if (data.SaleDataCollection.length){
      //Busca os resgistros de boleto validos
      data = data.SaleDataCollection.find((e) => {
        return e.BoletoTransactionDataCollection != undefined;
      });

      if (data){
        data = data.BoletoTransactionDataCollection[0];
        return data;
      }
    }

    return undefined;
  }


  saleWasPay(sale, paymentDate, expirationDate, callback){
    //Não pode colocar para em aberto, se não o status volta do magento para o eccosys
    this.updateSale(sale, 0 /* Em Aberto */, paymentDate, expirationDate, Const.sale_was_confirmed_mundi, callback)
  }

  saleHasOverdue(sale, paymentDate, expirationDate, callback){
    this.updateSale(sale, 2 /* Cancelado */,  paymentDate, expirationDate, Const.sale_was_unconfirmed_mundi, callback)
  }

  updateSale(sale, status, paymentDate, expirationDate, obsFormat, callback){
    var msg = obsFormat.format(sale.numeroPedido, sale.numeroDaOrdemDeCompra, Dat.format(new Date(sale.data)), Dat.format(expirationDate), paymentDate ? Dat.format(paymentDate) : '');

    this.updateEccoSale(sale, status, paymentDate, msg, () => {
      this.updateMagentoSale(sale, status, msg, callback);
    })
  }

  updateEccoSale(sale, status, paymentDate, msg, callback){
    var body = {
      situacao: status,
      numeroPedido: sale.numeroPedido,
      tipoPagamento: TAG_ID,
      dataPagamento: paymentDate ? Dat.api(paymentDate): 'null',
      observacaoInterna: sale.observacaoInterna + '\n' + msg
    };

    new EccosysStorer().sale().update([body]).go(() => {
      History.job(this.getName(), msg, this.getInfo().tag);
      callback();
    });
  }

  updateMagentoSale(sale, status, msg, callback){
    this.magentoApi.instance((handler) => {
      handler.salesOrder.addComment({
        orderIncrementId: sale.numeroDaOrdemDeCompra,
        status:           status  == 0 ? 'processing' : 'canceled',
        comment:          '[Hawk]: ' + msg,
        notify:           true
      }, (result) => {
        callback();
      });
    })
  }

};
