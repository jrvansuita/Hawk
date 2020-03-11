const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const MagentoCalls = require('../magento/magento-calls.js');
const SaleCustomerInfoBuilder = require('../customer/sale-customer-info-builder.js');


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
      if (sale){
        this.load(sale.idContato, callback);
      }else{
        callback({error: 'Pedido não encontrado. Talves seja um pedido muito recente.'});
      }
    });
  },

  findSalesList(idClient, callback){
    new MagentoCalls().saleByClient(idClient).then(callback);
  },

  loadSale(saleNumber, callback){
    new SaleCustomerInfoBuilder(saleNumber).load((data, provisorio) => {
      callback({data :data, provisorio: provisorio});
    })
  },

  searchAutoComplete(typing, callback){
    Client.likeThis(typing, 50, (err, data)=>{
      callback(data);
    });
  }
};
