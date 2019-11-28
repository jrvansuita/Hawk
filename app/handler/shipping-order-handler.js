const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const EccosysStorer = require('../eccosys_new/eccosys-storer.js');


module.exports = {

  create(transport, callback){
    new EccosysStorer().shippingOrder().insert({
      transportador: transport
    }).go(callback);
  },

  refresh(id, nfs, callback){
    new EccosysStorer().shippingOrder().update(id, nfs).go(callback);
  }
}