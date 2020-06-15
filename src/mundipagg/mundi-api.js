const https = require('https')
const Err = require('../error/error.js')
var Query = require('../util/query.js')

module.exports = class MundiApi {
  options () {
    var options = {
      host: Params.mundipaggUrl(),
      timeout: 60000, // 1 minutos
      method: 'GET',
      url: 'https://' + Params.mundipaggUrl() + this.path,
      path: '/Sale/' + this.path,
      headers: {
        MerchantKey: Params.mundipaggSecret(),
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json'
      }
    }

    return options
  }

  go (callback) {
    var req = https.request(this.options(), function (res) {
      var responseBody = ''

      res.on('data', function (chunk) {
        responseBody += chunk
      })

      res.on('end', function () {
        callback(JSON.parse(responseBody))
      })
    })

    req.on('error', function (e) {
      console.log(e)
    })
    req.end()
  }

  sale (saleNumber) {
    this.path = 'Query/OrderReference=' + saleNumber
    return this
  }
}
