const EccosysProvider = require('../eccosys_new/eccosys-provider.js');

module.exports = {



  load(query, page, callback){
    var provider = new EccosysProvider(true);

    provider
    .shippingOrder()
    .pageCount(20)
    .page(page)

    provider.param('situacao', query.situation ? query.situation : '0,1,2')

    if (query.transport){
      provider.param('transportadora', encodeURIComponent(query.transport))
    }

    if (query.begin && query.end){
      provider.dates(new Date(parseInt(query.begin)), new Date(parseInt(query.end)))
    }


    provider.go(callback);
  },


};
