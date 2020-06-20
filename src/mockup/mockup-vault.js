
const Mock = require('../bean/mock.js')
const ProductMockupBuilder = require('../mockup/product-mockup-builder.js')

module.exports = class MockVault {
  static storeFromScreen (params, callback) {
    var mock = new Mock(
      params.name,
      params.fontName,
      params.mockurl,
      params.backurl,
      params.msg,
      params.fontColor,
      params.fontShadowColor,
      params.priceBottomMargin,
      params.showDiscount,
      params.fontNameDiscount,
      params.discountFontColor,
      params.discountShadowColor,
      params.discountBackground,
      params.discountBackgroundShadow,
      params.width,
      params.height,
      params.widthProduct,
      params.heightProduct,
      params.productImgMargins
    )

    ProductMockupBuilder.clearCache()

    if (params._id.toString().length > 0) {
      mock._id = params._id
    }

    if (mock._id) {
      mock.upsert((_err, doc) => {
        callback(doc ? doc._id : 0)
      })
    } else {
      Mock.create(mock, (_err, doc) => {
        callback(doc ? doc._id : 0)
      })
    }
  }
}
