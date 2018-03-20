const http = require('http');
var MD5 = require('../util/md5.js');
var dateFormat = require('dateformat');

var exports = module.exports = {};

//Url do Eccosys
const host = "boutiqueinfantil.eccosys.com.br";
// ApiKey do Eccosys
const apiKey = 'b37f6a2583f10f369c549333b7c76cdaa4c56801';
// secret da aplicação gerada no Eccosys
const secret = '3986a24a30abc5e54c198444c289bf11f6c1a916';

exports.get = (path, onEnd) => {

  var body = '';

  console.log(getOptions(path));

  var req = http.request(getOptions(path), function(res) {

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      onEnd(body);
    });
  });

  req.on('error', function(e) {
    console.log(e);
  });

  req.end();

};

function getOptions(path) {
  return {
    host: host,
    path: '/api/' + path,
    method: 'GET',
    headers: {
      'signature': generateSignature(),
      'apikey': apiKey,
      'Content-Type': 'application/json; charset=utf-8'
    }
  };
}

// Gera uma nova Signature
var signature;

function generateSignature() {
  if (!signature) {
    signature = MD5.get(secret + ":" + dateFormat(new Date(), "dd-mm-yyyy"));
  }

  return signature;
}