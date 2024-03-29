const https = require('https')

module.exports = class MundiApi {
  options () {
    var options = {
      host: global.Params.mundipaggUrl(),
      timeout: 60000, // 1 minutos
      method: 'GET',
      url: 'https://' + global.Params.mundipaggUrl() + this.path,
      path: '/Sale/' + this.path,
      headers: {
        MerchantKey: global.Params.mundipaggSecret(),
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json'
      }
    }

    return options
  }

  onError (callback) {
    this.onError = callback
    return this
  }

  go (callback) {
    var req = https.request(this.options(), (res) => {
      var responseBody = ''

      res.on('data', function (chunk) {
        responseBody += chunk
      })

      res.on('end', () => {
        try {
          callback(JSON.parse(responseBody))
        } catch (e) {
          if (this.onError) this.onError(e)
        }
      })
    })

    req.on('error', function (e) {
      if (this.onError) this.onError(e)
    })
    req.end()
  }

  sale (saleNumber) {
    this.path = 'Query/OrderReference=' + saleNumber
    return this
  }
}
