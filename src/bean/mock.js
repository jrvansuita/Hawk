const Str = global.Str

module.exports = class MockSetting extends DataAccess {
  constructor (name, fontName, imgUrl, backUrl, msg, fontColor, fontShadowColor, priceBottomMargin, showDiscount, fontNameDiscount, discountFontColor, discountShadowColor, discountBackground, discountBackgroundShadow, width, height, widthProduct, heightProduct, productImgMargins) {
    super()
    this.name = Str.def(name)
    this.fontName = Str.def(fontName)
    this.msg = Str.def(msg)
    this.imgUrl = Str.def(imgUrl)
    this.backUrl = Str.def(backUrl)

    this.fontColor = Str.def(fontColor)
    this.fontShadowColor = Str.def(fontShadowColor)
    this.priceBottomMargin = Num.def(priceBottomMargin)

    this.showDiscount = !!showDiscount
    this.fontNameDiscount = Str.def(fontNameDiscount)
    this.discountFontColor = Str.def(discountFontColor)
    this.discountShadowColor = Str.def(discountShadowColor)
    this.discountBackground = Str.def(discountBackground)
    this.discountBackgroundShadow = Str.def(discountBackgroundShadow)

    this.width = Num.def(width)
    this.height = Num.def(height)

    this.widthProduct = Num.def(widthProduct)
    this.heightProduct = Num.def(heightProduct)
    this.productImgMargins = Str.def(productImgMargins)
  }

  static from (params) {
    return new MockSetting(
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
  }

  static normalize (mock) {
    mock = mock.toObject?.() ?? mock

    mock = this.splitProductMargins(mock)
    mock = this.handleProductSize(mock)

    return mock
  }

  static handleProductSize (mock) {
    mock.widthProduct = mock.widthProduct || (mock.width - (mock.productImgMargins.right + mock.productImgMargins.left))
    mock.heightProduct = mock.heightProduct || (mock.height - (mock.productImgMargins.top + mock.productImgMargins.bottom))
    return mock
  }

  static splitProductMargins (mock) {
    var getMargin = (index) => {
      return parseInt(mock.productImgMargins?.split(',')?.[index]?.trim() || 0)
    }

    mock.productImgMargins = {
      top: getMargin(0),
      right: getMargin(1),
      bottom: getMargin(2),
      left: getMargin(3),
      square: (mock.heightProduct - mock.widthProduct) === 0
    }

    return mock
  }

  static getKey () {
    return ['_id']
  }
}
