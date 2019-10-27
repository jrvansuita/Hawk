var EccosysApi = require('../eccosys_new/eccosys-api.js');

module.exports = class EccosysStorer extends EccosysApi{

  product(body) {
    return this.put('produtos').setBody(body).single();
  }

  stock(sku, body) {
    return this.post('estoques/' + sku).setBody(body).single();
  }

  nfe(user, saleNumber){
    return this.post('nfes/' + saleNumber).setBody({}).withUser(user).single();
  }

  retryNfe(user, idNfe){
    return this.post('nfes/' + idNfe + '/autorizar').setBody({}).withUser(user).single();
  }

  sale(saleNumber){
    return {
      update:(body) => {
        return this.put('pedidos').setBody(body).single();
      },

      items:() => {
        return {
          update:(body) => {
            return this.put('pedidos/items').setBody(body);
          },

          insert:(body) => {
            return this.post('pedidos/' + saleNumber + '/items').setBody(body);
          },

          delete:(body) => {
            return this.delete('pedidos/' + saleNumber + '/items');
          },
        }
      }
    };
  }

};
