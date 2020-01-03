



const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {



const job = require('./app/jobs/job-mundipagg-checker.js');

const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

new EccosysProvider().sale('729422').go((sale) => {
  new job().handleSale(sale);
})




});
