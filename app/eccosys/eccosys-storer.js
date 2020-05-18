const EccosysApi = require('../eccosys/eccosys-api.js');
const Err = require('../error/error.js');

module.exports = class EccosysStorer extends EccosysApi{

  product(sku){
    return {
      update:(body) => {
        return this.put('produtos').setBody(body).single();
      },

      insert:(body) => {
        return this.post('produtos').setBody(body).single();
      },

      upsert: function (isUpdate, body) {
        if (isUpdate){ return this.update(body) }else{ return this.insert(body) }
      },

      delete:() => {
        return this.delete('produtos/' + sku);
      },

      attrs:()=>{
        return {
          put:(body)=>{
            return this.post('produtos/' + sku + '/atributos').setBody(body).single();
          }

        }
      }


    }
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

  cancelNfe(user, numberNfe, body){
    return this.post('nfes/' + numberNfe + '/cancelar').nfeParams().setBody(body).withUser(user).single();
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

          delete:() => {
            return this.delete('pedidos/' + saleNumber + '/items');
          },
        }
      }
    };
  }


  shippingOrder(user) {
    if (!Util.isTokenOk(user)){
      throw Err.thrw(Const.no_token);
    }

    return {
      colected: (id) => {
        return  this.post('ordem-de-coleta/' + id + '/coletada').withUser(user);
      },

      update:(id, idsNfeArr) => {
        return  this.put('ordem-de-coleta/' + id).setBody(idsNfeArr).withUser(user);
      },

      insert: (body) => {
        return this.post('ordem-de-coleta').setBody(body).withUser(user);
      }
    };
  }


};
