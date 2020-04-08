const https = require('https');
const Query = require('../util/query.js');

module.exports = class GetResponseAPI {

  prepareBody(data){
    this.body = JSON.stringify({
      "name": data.nome,
      "campaign": {
        "campaignId": "w"
      },
      "email": data.email,

      "customFieldValues": [
        {
          "customFieldId": "V",
          "value": [
            data.dataNascimento
          ],
        }]
    });
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


  options(){

    var options = {
      host: 'api.getresponse.com',
      method: this.method,
      path: '/v3/' + this.path,
      headers: {
        'Content-Type': 'application/json',
        'X-Domain': 'emkt.boutiqueinfantil.com.br',
        'X-Auth-Token': 'api-key ' + Params.getResponseSecret(),
      }
    };
    return options;
  }


  go(){

    var req = https.request(this.options(), function(res) {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', data => {
        process.stdout.write(data)
      })
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
