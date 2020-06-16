const GiftRule = require('../bean/gift-rule.js')

module.exports = class {
  static storeFromScreen (params, callback) {
    var gift = new GiftRule(
      params.id,
      params.name,
      params.active,
      params.checkStock,
      new Date(parseInt(params.expires)),
      params.sendEmail
    )

    gift.addSkus(params.skus)
    gift.addRules(params.rules)

    gift.upsert((_err, doc) => {
      callback(doc)
    })
  }

  static delete (id, callback) {
    GiftRule.findOne({ id: id }, (_err, item) => {
      item.remove(callback)
    })
  }
}
