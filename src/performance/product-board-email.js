const Product = require('../bean/product.js')
const EmailBuilder = require('../email/email-builder.js')

module.exports = class ProductBoardEmailHandler {
  go (callback) {
    var props = ['manufacturer', 'category']
    Product.getStockBalance(100, props, (_err, inData) => {
      Product.getStockBalance(-50, props, (_err, outData) => {
        this._sendIfNeeded(Object.assign({}, this._buildObject(inData, 'in_'), this._buildObject(outData, 'out_')))
      })
    })
  }

  _buildObject (data, type) {
    var arrays = {}
    Util.forProperty(data, (each, key) => {
      arrays[type + key] = each.sort((a, b) => {
        return b.stock - a.stock
      })
    })
    return arrays
  }

  _sendIfNeeded (result) {
    var count = Object.values(result).reduce((c, arr) => { return c + arr.length }, 0)
    if (count > 0) this._sendEmail(result)
  }

  _sendEmail (data) {
    console.log(data)

    new EmailBuilder()
      .template('STOCK')
      .to(Params.performanceEmailsReport())
      .setData(data)
      .send(() => {

      })
  }
}
