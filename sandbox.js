
const Initilizer = require('./app/abra-cadabra/initializer.js');


new Initilizer(__dirname, true).begin(() => {

  const SaleLoader = require('./app/loader/sale-loader.js');


  var loader = new SaleLoader('857465');

  loader.loadItems()
  .loadItemsDeepAttrs(null, (item, product) => {
    item.cost = product.precoCusto;
  })
  .setOnError(this.onError)
  .run((sale) => {

  });

});
