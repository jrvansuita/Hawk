const https = require('https');
var MD5 = require('../util/md5.js');
const History = require('../bean/history.js');

var exports = module.exports = {};

const host = process.env.ECCOSYS_HOST;
const apiKey = process.env.ECCOSYS_API;
const secret = process.env.ECCOSYS_SECRET;

exports.get = (path, onResponse) => {
  makeRequest(getOptions(path, 'GET'), null,  onResponse);
};

exports.put = (path, body, onResponse) => {
  makeRequest(getOptions(path, 'PUT'), body, onResponse);
};

exports.post = (path, body, onResponse) => {
  makeRequest(getOptions(path, 'POST'), body, onResponse);
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
    console.log(e);
  });

  if (postBody){
    req.write(JSON.stringify(postBody));
  }

  req.end();
}

function getOptions(path, method) {
  var options = {
    host: host,
    port: 443,
    path: '/api/' + encodeURI(path),
    method: method,
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


function checkEccoStatus(data){
  if (data.includes('503 Service Temporarily Unavailable')){
     History.error("API Eccosys indisponível no momento.");
     return '[]';
  }

  return data;
}
