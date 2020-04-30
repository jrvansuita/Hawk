const https = require('https');
const Initilizer = require('./app/abra-cadabra/initializer.js');




new Initilizer(__dirname, true).begin(() => {

  const SaleLoader = require('./app/loader/sale-loader.js');
  const SaleCustomerHandler = require('./app/customer/sale-customer-handler.js');

  var sale = "120956747";
120943177



 new SaleLoader(sale)
  //.loadNfe()
  .run((sale) => {
    //console.log(sale.numeroNotaFiscal);
    new SaleCustomerHandler().cancelNfe('Teste cancelamento', sale.numeroNotaFiscal, (res) => {
      console.log(res.sucess);
    })
  });
});
