const Product = require('../bean/product.js')
const EmailBuilder = require('../email/email-builder.js')

module.exports = class ProductBoardEmailHandler {
  go (callback) {
    var props = ['manufacturer', 'category']
    Product.getStockBalance(100, props, (_err, inData) => {
      Product.getStockBalance(-50, props, (_err, outData) => {
        var result = Object.assign({}, this._buildObject(inData[0], 'in_'), this._buildObject(outData[0], 'out_'))
        this._sendIfNeeded(result)
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
    var count = 0
    Object.values(result).forEach((each) => {
      each.forEach(() => {
        count++
      })
    })
    if (count > 0) this._sendEmail(result)
  }

  _sendEmail (data) {
    new EmailBuilder()
      .template('STOCK')
      .to(Params.performanceEmailsReport())
      .setData(data)
      .send(() => {

      })
  }
}
