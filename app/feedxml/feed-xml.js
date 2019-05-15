const https = require('https');

var exports = module.exports = {};

const url = process.env.STORE_UTL;
const path = "/media/feed/feed-apps.xml";


exports.get = (onEnd) => {

  var xmlStr = '';

  var req = https.request(url + path, function(res) {
    res.on('data', function(chunk) {
      xmlStr += chunk;
    });

    res.on('end', function() {
      var parseString = require('xml2js').parseString;
      parseString(xmlStr, function (err, xml) {
        onEnd(xml);
      });
    });
  });

  req.on('error', function(e) {
    console.log('Erro ao ler feed xml: ' + e.toString());
  });

  req.end();
};



exports.val = (item, name)=>{
  var data = item["g:" + name] || item[name];

  if (data.length > 0){
    return data[0];

  }
  return '';
};
