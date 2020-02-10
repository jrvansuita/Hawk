const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = {

  list(query, page, callback){
    var provider = new EccosysProvider();

    provider
    .pageCount(50)
    .shippingOrderList()
    .page(page)

    provider.param('situacao', query.situation ? query.situation : '0,1,2')

    if (query.transport){
      provider.param('q_transportadora', encodeURIComponent(query.transport))
    }

    if (query.user){
      provider.param('usuario', encodeURIComponent(query.user))
    }

    if (query.begin && query.end){
      provider.dates(new Date(parseInt(query.begin)), new Date(parseInt(query.end)))
    }

    provider.go((data) => {
      callback(data);
    });
  },


  get(query, callback){
      new EccosysProvider()
      .shippingOrder(query)
      .go((result) => {
        callback(result);
      });
  }
};
