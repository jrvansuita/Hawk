const https = require('https');
const Initilizer = require('./app/abra-cadabra/initializer.js');




new Initilizer(__dirname, true).begin(() => {

  const SaleStock = require('./app/bean/sale-stock.js');
  const Product = require('./app/bean/product.js');


  //SaleStock.updateAll({}, {$set: {stock: {$multiply: ["$quantity" , 7]}}});

});
