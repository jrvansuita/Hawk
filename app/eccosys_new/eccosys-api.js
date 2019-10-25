const https = require('https');
var MD5 = require('../util/md5.js');

const HOST = process.env.ECCOSYS_HOST;
const APIKEY = process.env.ECCOSYS_API;
const SECRET = process.env.ECCOSYS_SECRET;

const Err = require('../error/error.js');
var Query = require('../util/query.js');


module.exports = class EccosysApi{

  constructor(){
    this.query = new Query('$');
    this.page_count = 100;
    this.parsedJsonResult = true;
  }

  pageCount(pageCount){
    this.page_count = pageCount;
    return this;
  }

  page(page){
    this.query.add('count', this.page_count);
    this.query.add('offset', this.page_count * page);
    return this;
  }

  limit(limit){
    return this.pageCount(limit).page(0);
  }

  dates(from, to, considerDate){
    if (considerDate){
      this.query.add('dataConsiderada', considerDate);
    }

    this.query.addDate('fromDate', from);
    this.query.addDate('toDate', to);

    return this;
  }

  order(order){
    this.query.add('order', order);
    return this;
  }

  active(){
    this.query.add('filter', 'situacao=A');
    return this;
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

  filter(func){
    this.onFilter = func;
    return this;
  }

  jsonFilter(multiple){
    return this.filter((data)=>{
      var def = multiple ? [] : undefined;
      var result = multiple ? [].concat(data) : (data[0] || data);
      return typeof data == 'string' ? def : result;
    });
  }

  single(){
    return this.jsonFilter(false);
  }

  multiple(){
    return this.jsonFilter(true);
  }


  options(){
    var params = this.query.hasParams() ? this.query.build() : '';

    var path = '/api/' + encodeURI(this.path) + params;

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

    console.log(path);

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
      if (global.eccoConnErrors <= 2){
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



  make(onGetResponse, onGetBuffer){
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

        if (self.parsedJsonResult){
          responseBody = JSON.parse(responseBody);
        }

        if (self.onFilter){
          responseBody = self.onFilter(responseBody);
        }

        if (onGetResponse){
          onGetResponse(responseBody);
        }

        if (onGetBuffer){
          onGetBuffer(chucks);
        }
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

  get(path){
    return this.setMethod('GET').setPath(path);
  }

  put(path){
    return this.setMethod('PUT').setPath(path);
  }

  post(path){
    return this.setMethod('POST').setPath(path);
  }

  delete(path){
    return this.setMethod('DELETE').setPath(path);
  }

  download(path, res, docName){
    this.setMethod('GET').setPath(path).make(null, (chunks)=>{
      var file = new Buffer.concat(chunks);

      res.type('application/pdf');
      res.setHeader('Content-disposition', 'inline; filename="' + docName + '"');
      res.send(file);
    });
  }

  go(callback){
    this.make(callback);
  }


  pagging(){
    var page = 0;

    var callbackHandler = {
      each: function(callback){
        this.onEach = callback;
        return this;
      },

      end: function(callback) {
        this.onEnd = callback;
      }
    };

    var makePagging = ()=>{
      this.page(page).go((data)=>{
        page++;

        if (data.length > 0){
          if (callbackHandler.onEach){
            callbackHandler.onEach(data, makePagging);
          }
        }else{
          if (callbackHandler.onEnd){
            callbackHandler.onEnd();
          }
        }
      });
    };

    makePagging();

    return callbackHandler;
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
