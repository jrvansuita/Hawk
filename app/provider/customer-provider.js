const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
//const SaleLoader = require('../loader/sale-loader.js');
const MagentoCalls = require('../magento/magento-calls.js');
const SaleCustomerInfoBuilder = require('../builder/sale-customer-info-builder.js');
const MundiApi = require('../mundipagg/mundi-api.js');

module.exports = {

  load(id, callback){
    Client.findByKey(id, (err, client)=>{
      client = client ? client.toObject() : {};

      new EccosysProvider().client(id).go((eccoClient) => {

        this.findSalesList(eccoClient.codigo, (sales) => {

          callback({...client, ...eccoClient, sales: sales});
        });
      });
    });
  },

  findBySale(saleNumber, callback){
    new EccosysProvider().sale(saleNumber).go((sale) => {
      this.load(sale.idContato, callback);
    });
  },

  findSalesList(idClient, callback){
    new MagentoCalls().saleByClient(idClient).then(callback);
  },
/*
  checkSalePaymentStatus(sale){
    new MundiApi().sale(sale).go((data) => {
      this.handleBoleto(data);
      //callback(data);
    })
  },
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
  },

  handleBoleto(mundiData){
    data = this.getBoletoPaymentData(mundiData);

    if(data){
      console.log(data.BoletoTransactionStatus);
    }
  },
  */

  loadSale(saleNumber, callback){
    new SaleCustomerInfoBuilder(saleNumber).load((data, provisorio) => {
      //this.checkSalePaymentStatus(saleNumber);
      callback({data : data, provisorio: provisorio});
    })
  },

  searchAutoComplete(typing, callback){
    Client.likeThis(typing, 50, (err, data)=>{
      callback(data);
    });
  }
};
