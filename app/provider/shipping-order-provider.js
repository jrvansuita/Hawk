const EccosysProvider = require('../eccosys/eccosys-provider.js');


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


  get(number, callback){
    var foundOc = lastLoadedArr.find((each) => {
      return each.numeroColeta == number;
    });

    if (foundOc){
      callback(foundOc);
    }else{
      new EccosysProvider(true)
      .shippingOrder(number)
      .go((result) => {
        callback(result);
      });
    }
  },


};
