



const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {


  const MagentoCalls = require('./app/magento/magento-calls.js');


  /*new MagentoCalls().updateProductWeight('CB606ro-P', 0.1460).then((result) => {
    console.log(result);
  })*/



new MagentoCalls().salesOrderUpdate({
    orderIncrementId: '120838374',
    status:           'pending_payment',
    comment:          'teste',
    notify:           false
  }).then((r) => {
    console.log(r);
  });

 /*new MagentoCalls().product('PG012br-1').then((product) => {
   console.log(product);
 })*/





});
