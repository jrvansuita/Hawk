
  var xmlrpc = require('xmlrpc'); // for Magento 1.9 https fix

  var MagentoAPI = require('magento');
  var magento = new MagentoAPI({
    host: 'boutiqueinfantil.trezoshop.com',
    port: 443,
    path: '/api/xmlrpc/',
    login: 'teste',
    pass: 'A123456',
    secure: true
  });

  var isSecure = true;
  // IMPORTANT FIX: for https to work, exchange client
  if (isSecure) {
      magento.client = xmlrpc.createSecureClient(magento.config);
  }

  magento.login(function(err, sessId) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('deu certo');
  });




//https://github.com/alexpunct/magento-1-oauth-node
//https://github.com/ajsb85/node-magento-rest
/*var Magento = require('magento-rest');

var client = new Magento({
  consumer_key: '57e85326f2f3501b9b22dd4fdbfe88a5',
  consumer_secret: '4613948195a3ce13738b5677d3189694',
  access_token_key: 'c5f5744d0b054577833834ec0959a8bd',
  access_token_secret: '566fa99412f7f0b8e0a8f67ed40858a5'
});

var params = {screen_name: 'nodejs'};
client.get('statuses/user_timeline', params, function(error, products, response){
  if (!error) {
    console.log(products);
  }
});*/
