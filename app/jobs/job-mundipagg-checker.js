const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const MundiApi = require('../mundipagg/mundi-api.js');
const History = require('../bean/history.js');
const MagentoCalls = require('../magento/magento-calls.js');


const TAG_ID = 'MH';

module.exports = class JobMundipaggChecker extends Job{

  onInitialize(){
    this.magentoCalls = new MagentoCalls();
  }

  getName(){
    return 'Sincronização de Pagamentos';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      this.waitingPaymentSales(resolve, reject);
    });
  }


  waitingPaymentSales(onTerminate, onError){
    new EccosysProvider()
    .setOnError(onError)
    .pageCount(1000)
    .dates(Dat.firstDayOfLastMonth(), Dat.rollDay(new Date(), -2), 'data')
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
    return Dat.daysDif(new Date(sale.data), new Date()) >= 2;
  }

  handleSale(sale, nextSale){
    if (this.saleChecked(sale)){
      new MundiApi().sale(sale.numeroDaOrdemDeCompra).go((data) => {
        if (!this.handleBoleto(sale, data, nextSale)){
          this.handleCreditCard(sale, data, nextSale);
        }
      });
    }else{
      nextSale();
    }
  }

  handleCreditCard(sale, mundiData, nextSale){
    var data = this.getCreditCardPaymentData(mundiData);

    if (data){
      var payDate = data.CapturedDate ? new Date(data.CapturedDate) : undefined;
      var method = '[CreditCard] - ' + data.AcquirerMessage;

      if (data.CreditCardTransactionStatus.includes('Captured')){
        this.saleWasPay(sale, payDate, payDate, method, nextSale);
      }else {
        if (data.CreditCardTransactionStatus.includes('NotAuthorized')){
          this.saleHasOverdue(sale, payDate, new Date(), method, nextSale);
        }else{
          this.logThis(sale, null);
          nextSale();
        }
      }
    }else{
      nextSale();
    }
  }

  handleBoleto(sale, mundiData, nextSale){
    var data = this.getBoletoPaymentData(mundiData);

    if (data){
      var expirationDate = new Date(data.ExpirationDate);
      var payDate = data.PaymentDate ? new Date(data.PaymentDate) : undefined;
      var method = '[Boleto]';

      if (data.BoletoTransactionStatus.includes('Paid')){
        this.saleWasPay(sale, payDate, expirationDate, method, nextSale);
      }else{
        if (Dat.daysDif(expirationDate, new Date()) > 2){
          this.saleHasOverdue(sale, payDate, expirationDate, method, nextSale);
        }else{
          this.logThis(sale, null);
          nextSale();
        }
      }

      return true;
    }

    return false;
  }


  getBoletoPaymentData(data){
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


  getCreditCardPaymentData(data){
    if (data.SaleDataCollection.length){
      var payRows = [];
      //Busca os resgistros de boleto validos
      data.SaleDataCollection.forEach((each) => {
        if (each.CreditCardTransactionDataCollection != undefined){
          payRows = payRows.concat(each.CreditCardTransactionDataCollection);
        }
      });

      if (payRows.length){
        data = payRows.find((each) => {
          return each.CreditCardTransactionStatus.includes('Captured');
        });
        return data || payRows[0];
      }
    }

    return undefined;
  }


  saleWasPay(sale, paymentDate, expirationDate, method, callback){
    //Não pode colocar para em aberto, se não o status volta do magento para o eccosys
    this.updateSale(sale, 0 /* Em Aberto */, paymentDate, expirationDate, Const.sale_was_confirmed_mundi, method, callback)
  }

  saleHasOverdue(sale, paymentDate, expirationDate, method, callback){
    this.updateSale(sale, 2 /* Cancelado */,  paymentDate, expirationDate, Const.sale_was_unconfirmed_mundi, method, callback)
  }

  updateSale(sale, status, paymentDate, expirationDate, obsFormat, method, callback){
    var msg = obsFormat.format(sale.numeroPedido, method, sale.numeroDaOrdemDeCompra, Dat.format(new Date(sale.data)), Dat.format(expirationDate), paymentDate ? Dat.format(paymentDate) : '');
    this.logThis(sale, status);

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
      callback();
      History.job(this.getName(), msg, this.getInfo().tag);
    });
  }

  updateMagentoSale(sale, status, msg, callback){
    this.magentoCalls.salesOrderUpdate({
      orderIncrementId: sale.numeroDaOrdemDeCompra,
      status:           status  == 0 ? 'processing' : 'canceled',
      comment:          '[Hawk]: ' + msg,
      notify:           true
    }).then(callback);
  }

  logThis(sale, status){
    console.log('OC: ' + sale.numeroDaOrdemDeCompra + ' Data: ' + Dat.format(new Date(sale.data)) + (status != null ? (status == 0 ?' Aprovado' : ' Cancelado') : ' Não vencido'));
  }

};
