const https = require('https')

var exports = module.exports = {}

exports.get = (onEnd) => {
  var xmlStr = ''

  var req = https.request(Params.storeFeedUrl(), function (res) {
    res.on('data', function (chunk) {
      xmlStr += chunk
    })

    res.on('end', function () {
      var parseString = require('xml2js').parseString
      parseString(xmlStr, function (err, xml) {
        onEnd(xml)
      })
    })
  })

  req.on('error', function (e) {
    console.log('Erro ao ler feed xml: ' + e.toString())
  })

  req.end()
}

exports.val = (item, name) => {
  var data = item[name]

  if (data.length > 0) {
    return data[0]
  }
  return ''
}
