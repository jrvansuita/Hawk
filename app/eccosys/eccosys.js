const https = require('https');
var MD5 = require('../util/md5.js');

var exports = module.exports = {};

const host = process.env.ECCOSYS_HOST;
const apiKey = process.env.ECCOSYS_API;
const secret = process.env.ECCOSYS_SECRET;

exports.get = (path, onEnd) => {

  var body = '';

  var req = https.request(getOptions(path), function(res) {

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
    port: 443,
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
    signature = MD5.get(secret + ":" + Dat.signatureDate(new Date()));
  }

  return signature;


}
