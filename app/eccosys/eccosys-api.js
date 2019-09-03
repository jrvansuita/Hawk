const https = require('https');
var MD5 = require('../util/md5.js');

const HOST = process.env.ECCOSYS_HOST;
const APIKEY = process.env.ECCOSYS_API;
const SECRET = process.env.ECCOSYS_SECRET;

const Err = require('../error/error.js');


module.exports = class EccosysApi{

  constructor(path){
    this.setPath(path);
  }

  setMethod(method){
    this.method = method;
    return this;
  }

  withUser(user){
    this.user = user;
    return this;
  }

  setPath(path){
    this.path = path;
    return this;
  }

  setBody(body){
    this.body = body;
    return this;
  }

  setOnError(onError){
    this.onError = onError;
    return this;
  }

  options(){
    var path = '/api/' + encodeURI(this.path);

    var options = {
      host: HOST,
      port: 443,
      timeout: 60000, // 1 minutos
      path: path,
      method: this.method,
      url: 'https://' + HOST + path,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    };

    if (this.user && this.user.token){
      options.headers['x-access-token'] = this.user.token;
    }else{
      options.headers.signature = generateSignature();
      options.headers.apikey = APIKEY;
    }


    //console.log(options);

    return options;
  }



  checkErrorStatus(data){
    if (
      data.includes('Service Temporarily Unavailable') ||
      data.includes('Bad Gateway') ||
      data.includes('<html>')
    ){

      global.eccoConnErrors++;

      //Só vamos dar throw nas 5 primeiras requests.
      //Se nao fica muito poluído o historico
      if (global.eccoConnErrors <= 5){
        var msg = data.includes('<title>502') ? '502 Bad Gateway' : data;

        throw Err.thrw(Const.api_not_available.format(msg) + '\n' + this.method +': /' + this.path, this.user);
      }else{
        throw undefined;
      }
    }else{
      if (global.eccoConnErrors > 0){
        global.eccoConnErrors--;
      }
    }

    return data;
  }



  make(onResponse){
    var self = this;
    var req = https.request(this.options(), function(res) {

      var responseBody = '';
      var chucks = [];

      res.on('data', function(chunk) {
        responseBody += chunk;
        chucks.push(chunk);
      });

      res.on('end', function() {
        self.checkErrorStatus(responseBody);
        onResponse(responseBody, chucks);
      });
    });

    req.on('error', function(e) {
      if (self.onError){
        self.onError(new Err(e.toString(), self.user));
      }
    });

    if (this.body){
      req.write(JSON.stringify(this.body));
    }


    req.end();
  }

  get(callback){
    this.setMethod('GET').make(callback);
  }


  put(callback){
    this.setMethod('PUT').make(callback);
  }

  post(callback){
    this.setMethod('post').make(callback);
  }

  delete(callback){
    this.setMethod('DELETE').make(callback);
  }

  download(res, docName){
    this.setMethod('GET').make((responseBody, chunks)=>{
      var file = new Buffer.concat(chunks);

      res.type('application/pdf');
      res.setHeader('Content-disposition', 'inline; filename="' + docName + '"');
      res.send(file);
    });
  }

};


// Gera uma nova Signature
var signature;

function generateSignature() {
  if (!signature) {
    signature = MD5.get(SECRET + ":" + Dat.signatureDate(new Date()));
  }

  return signature;
}
