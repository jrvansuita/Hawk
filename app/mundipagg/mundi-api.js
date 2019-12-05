const https = require('https');

const HOST = process.env.MUNDI_HOST;
const SECRET = process.env.MUNDI_SECRET;


const Err = require('../error/error.js');
var Query = require('../util/query.js');


module.exports = class MundiApi{


  constructor(){

  }


  options(){
    var options = {
      host: HOST,
      timeout: 60000, // 1 minutos
      method: 'GET',
      url: 'https://' + HOST + this.path,
      path: '/Sale/' + this.path,
      headers: {
        'MerchantKey': SECRET,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept' : 'application/json'
      }
    };


    //console.log(options);

    return options;
  }


  go(callback){
    var req = https.request(this.options(), function(res) {

      var responseBody = '';

      res.on('data', function(chunk) {
        responseBody += chunk;
      });

      res.on('end', function() {
        callback(JSON.parse(responseBody));
      });

    });

    req.on('error', function(e) {
      console.log(e);
    });
    req.end();
  }


  sale(saleNumber){
    this.path = 'Query/OrderReference=' + saleNumber;
    return this;
  }

};
