const EccosysProvider = require('../eccosys/eccosys-provider.js');
const TransportLaws = require('../laws/transport-laws.js');

var lastLoadedArr = [];

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
      lastLoadedArr = data;
      callback(data);
    });
  },


  get(query, callback){
    var foundOc = lastLoadedArr.find((each) => {
      return query.id ? (each.id == query.id) : (each.numeroColeta == query.number);
    });

    if (foundOc){
      callback(foundOc);
    }else{
      new EccosysProvider()
      .shippingOrder(query)
      .go((result) => {
        callback(result);
      });
    }
  }
};
