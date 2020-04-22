const https = require('https');
const Initilizer = require('./app/abra-cadabra/initializer.js');




new Initilizer(__dirname, true).begin(() => {


const MagentoCalls = require('./app/magento/magento-calls.js');

 new MagentoCalls().productStock('60311of-M').then((err, data) => {
   console.log(data);
   console.log(err);
 });

});
