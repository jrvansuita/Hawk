const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const SaleLoader = require('../loader/sale-loader.js');
const MagentoCalls = require('../magento/magento-calls.js');

module.exports = {

  load(id, callback){
    Client.findByKey(id, (err, client)=>{
      client = client ? client.toObject() : {};

      new EccosysProvider().client(id).go((eccoClient) => {

        this.findSales(eccoClient.codigo, (sales) => {

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

  findSales(idClient, callback){
    new MagentoCalls().saleByClient(idClient).then(callback);
  },

  searchAutoComplete(typing, callback){
    Client.likeThis(typing, 50, (err, data)=>{
      callback(data);
    });
  }


};
