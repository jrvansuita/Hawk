const https = require('https');
const Query = require('../util/query.js');

module.exports = class GetResponseAPI {

  constructor(){
    this.query = new Query();
  }

  setBody(data){
    this.body = data;
    return this;
  }

  setMethod(method){
    this.method = method;
    return this;
  }

  setPath(path){
    this.path = path;
    return this;
  }

  post(path){
    return this.setMethod('POST').setPath(path);
  }

  get(path){
    return this.setMethod('GET').setPath(path);
  }

  findContact(email){
    this.query.add('query[email]', email);
    return this;
  }


  options(){

    var query = this.query.hasParams() ? this.query.build() : '';

    var path = '/v3/'+ encodeURI(this.path + query);
    //console.log(path);

    var options = {
      host: 'api.getresponse.com',
      method: this.method,
      path: path,
      headers: {
        'Content-Type': 'application/json',
        'X-Domain': Params.getResponseDomain(),
        'X-Auth-Token': 'api-key ' + Params.getResponseSecret(),
      }
    };

    this.query.clear();

    return options;
  }


  go(callback){

    var req = https.request(this.options(), function(res) {
      var responseBody = '';

      //console.log(`statusCode: ${res.statusCode}`);

      res.on('data', function(data) {
        responseBody +=data;
      });

      res.on('end', function(){
        if(responseBody){
          responseBody = JSON.parse(responseBody);
          callback(responseBody);
        }else{
          callback();
        }
      });
    });

    req.on('error', error => {
      console.error(error)
    });

    if(this.body){
      req.write(this.body);
    }

    req.end();
  }

}
