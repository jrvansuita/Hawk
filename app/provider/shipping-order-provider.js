const EccosysProvider = require('../eccosys_new/eccosys-provider.js');


var lastLoadedArr = [];

module.exports = {

  list(query, page, callback){
    var provider = new EccosysProvider();

    provider
    .shippingOrderList()
    .pageCount(20)
    .page(page)

    provider.param('situacao', query.situation ? query.situation : '0,1,2')

    if (query.transport){
      provider.param('transportadora', encodeURIComponent(query.transport))
    }

    if (query.begin && query.end){
      provider.dates(new Date(parseInt(query.begin)), new Date(parseInt(query.end)))
    }


    provider.go((data) => {
      lastLoadedArr = data;
      callback(data);
    });
  },


  get(idOc, callback){
    var foundOc = lastLoadedArr.find((each) => {
      return each.id == idOc;
    });

    if (foundOc){
      callback(foundOc);
    }else{
      new EccosysProvider()
      .shippingOrder(idOc)
      .go((result) => {
        callback(result);
      });
    }
  },


};
