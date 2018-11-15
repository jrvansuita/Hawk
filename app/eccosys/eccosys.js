const https = require('https');
var MD5 = require('../util/md5.js');

const History = typeof DataAccess == 'undefined' ? null :  require('../bean/history.js');

var exports = module.exports = {};

const host = process.env.ECCOSYS_HOST;
const apiKey = process.env.ECCOSYS_API;
const secret = process.env.ECCOSYS_SECRET;

exports.get = (path, onResponse) => {
  makeRequest(getOptions(path, 'GET', true), null,  onResponse);
};

exports.put = (path, body, onResponse) => {
  makeRequest(getOptions(path, 'PUT', true), body, onResponse);
};

exports.post = (path, body, onResponse) => {
  makeRequest(getOptions(path, 'POST', true), body, onResponse);
};

function makeRequest(options, postBody, onResponse){
  var responseBody = '';

  var req = https.request(options, function(res) {
    res.on('data', function(chunk) {
      responseBody += chunk;
    });

    res.on('end', function() {
      onResponse(responseBody);
    });
  });

  req.on('error', function(e) {
    console.log('Erro na call eccosys');
    console.log(e);
  });

  if (postBody){
    req.write(JSON.stringify(postBody));
  }

  req.end();
}

function getOptions(path, method, isApiCall) {
  var _path = (isApiCall ? '/api/' : '') + encodeURI(path);

  var options = {
    host: host,
    port: 443,
    path: _path,
    method: method,
    url: 'https://' + host + _path,
    headers: {
      'signature': generateSignature(),
      'apikey': apiKey,
      'Content-Type': 'application/json; charset=utf-8'
    }
  };

  return options;
}

// Gera uma nova Signature
var signature;

function generateSignature() {
  if (!signature) {
    signature = MD5.get(secret + ":" + Dat.signatureDate(new Date()));
  }

  return signature;
}
