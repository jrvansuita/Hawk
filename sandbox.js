const https = require('https');
const Initilizer = require('./app/abra-cadabra/initializer.js');
const GetResponseHandler = require('./app/getresponse/getresponse-handler.js');



new Initilizer(__dirname, true).begin(() => {


  new GetResponseHandler().getCampaigns();

});
