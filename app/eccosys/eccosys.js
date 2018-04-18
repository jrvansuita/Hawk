const http = require('http');
var MD5 = require('../util/md5.js');

var exports = module.exports = {};

const host = process.env.ECCOSYS_HOST;
const apiKey = process.env.ECCOSYS_API;
const secret = process.env.ECCOSYS_SECRET;

exports.get = (path, onEnd) => {

  var body = '';

  //console.log(getOptions(path));

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
    signature = MD5.get(secret + ":" + Dat.api(new Date()));
  }

  return signature;
}