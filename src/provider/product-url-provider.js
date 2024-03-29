/* jshint esversion: 8 */
const cheerio = require('cheerio')
const https = require('https')

var cache = {}

module.exports = class {
  parse (data) {
    return new Promise((resolve, reject) => {
      const $ = cheerio.load(data)

      if ($('.content-404').length == 0) {
        var result = {
          image: $('#image').attr('src'),
          price: $('.special-price>.price').first().text().trim(),
          fromPrice: $('.old-price>.price').first().text().trim(),
          discount: $('.product-promotion-flag').text()
        }

        resolve(result.image ? result : null)
      } else {
        reject('Página do produto deu erro 404')
      }
    })
  }

  get (url) {
    return new Promise((resolve, reject) => {
      https.get(url, (resp) => {
        let data = ''

        resp.on('data', (chunk) => {
          data += chunk
        })

        resp.on('end', () => {
          resolve(data)
        })
      }).on('error', (err) => {
        reject(err)
      })
    })
  }

  async from (url) {
    if (cache[url]) {
      return Promise.resolve(cache[url])
    } else {
      const data = await this.get(url)
      const parsed = await this.parse(data)

      cache[url] = parsed
      return parsed
    }
  }
}
