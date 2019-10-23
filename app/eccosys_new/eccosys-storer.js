var EccosysApi = require('../eccosys_new/eccosys-api.js');

module.exports = class EccosysStorer extends EccosysApi{

  product(body) {
    return this.put('produtos').setBody(body).single();
  }

  stock(sku, body) {
    return this.post('estoques/' + sku).setBody(body).single();
  }

  sale(body) {
    return this.put('pedidos').setBody(body).single();
  }

  nfe(user, saleNumber){
    return this.post('nfes/' + saleNumber).setBody({}).withUser(user).single();
  }

  retryNfe(user, idNfe, ){
    return this.post('nfes/' + idNfe + '/autorizar').setBody({}).withUser(user).single();
  }

  saleItems(saleNumber, items, callback){
    return this.put('pedidos/items').setBody(items);
  }

};
