const { createCanvas, loadImage, registerFont } = require('canvas')
const TypeFace = require('../typeface/typeface.js')
const Mock = require('../bean/mock.js')

var _settingsCache = {}
var _productsImgCache = {}

module.exports = class ProductMockupBuilder {
  setMockupId (id) {
    this.mockId = id
    return this
  }

  setMockup (mock) {
    this.mock = Mock.normalize(mock)
    return this
  }

  static clearCache () {
    _settingsCache = {}
  }

  saveCache () {
    _settingsCache[this.mockId] = this.mock
  }

  setProduct (product) {
    this.product = product
    return this
  }

  setOnFinishedListener (listener) {
    this.setOnFinishedListener = (canvas) => {
      this.saveCache()
      listener(canvas)
    }
    return this
  }

  loadImgIfNedd (url, cached, callback) {
    var result = cached || _productsImgCache[url]

    if (result) {
      callback(result)
    } else {
      loadImage(url).then((image) => {
        _productsImgCache[url] = image
        callback(image)
      })
    }
  }

  loadImages (callback) {
    // Load the product image
    this.loadImgIfNedd(this._geProductImage(), null, (image) => {
      this.productImage = image

      // Load the mockup imaage
      this.loadImgIfNedd(this.mock.imgUrl, this.mock.mockupImage, (image) => {
        this.mock.mockupImage = image

        if (this.mock.backUrl) {
          // Load the mockup background image
          this.loadImgIfNedd(this.mock.backUrl, this.mock.backgroundImage, (image) => {
            this.mock.backgroundImage = image

            callback()
          })
        } else {
          callback()
        }
      })
    })
  }

  loadSettings (callback) {
    if (!this.mock) this.mock = _settingsCache[this.mockId]

    if (this.mock) {
      callback()
    } else {
      Mock.findOne({ _id: this.mockId }, (_err, mock) => {
        this.setMockup(mock)
        callback()
      })
    }
  }

  _geProductImage () {
    if (this.product) {
      if (this.product.online) {
        return this.product.online.image
      } else {
        return this.product.image
      }
    } else {
      return './front/img/product-placeholder.png'
    }
  }

  _getPrice () {
    if (this.product) {
      if (this.product.online) {
        return this.product.online.price
      } else {
        return Num.money(this.product.price)
      }
    } else {
      return 'R$ 0,00'
    }
  }

  _getFromPrice () {
    if (this.product) {
      if (this.product.online) {
        return this.product.online.fromPrice
      } else {
        return Num.money(this.product.fromPrice)
      }
    } else {
      return 'R$ 0,00'
    }
  }

  _getDiscount () {
    if (this.product) {
      if (this.product.online) {
        return this.product.online.discount + '%'
      } else {
        return Math.trunc(this.product.discount) + '%'
      }
    } else {
      return '0%'
    }
  }

  _getMsg () {
    var msg = this.mock.msg
      .replace('{preco}', this._getPrice())
      .replace('{preco-de}', this._getFromPrice())
      .replace('{desconto}', this._getDiscount())

    return msg
  }

  _getDiscountBackgroundColor () {
    var p = this.context.getImageData(this.canvas.width - 5, this.canvas.height - 5, 1, 1).data
    var s = ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)
    var backgroundColor = '#' + ('000000' + s).slice(-6)

    return backgroundColor
  }

  n (v) {
    var perc = (this.canvas.width) * 100 / 1000
    return perc * v / 100
  }

  applyFontShadow (shadowColor) {
    this.context.shadowColor = shadowColor
    this.context.shadowBlur = 5
    this.context.shadowOffsetX = 1
    this.context.shadowOffsetY = 1
  }

  // Filling canvas background
  fillCanvasBackground () {
    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  renderDiscount () {
    var rightMargin = this.n(100)
    var topMargin = this.n(100)

    // Circle for the discount
    this.context.beginPath()
    this.context.arc(this.canvas.width - rightMargin, topMargin, this.n(65), 0, 2 * Math.PI, false)
    this.context.fillStyle = this.mock.discountBackground == 'none' ? this._getDiscountBackgroundColor() : this.mock.discountBackground
    this.context.shadowColor = this.mock.discountBackgroundShadow
    this.context.shadowBlur = 10
    this.context.shadowOffsetX = 5
    this.context.shadowOffsetY = 5
    this.context.fill()

    rightMargin += this.n(this._getDiscount().length * 16)
    this.context.font = 'bold ' + this.n(30) + 'pt ' + this.mock.fontNameDiscount
    this.context.fillStyle = this.mock.discountFontColor
    this.applyFontShadow(this.mock.discountShadowColor)
    this.context.fillText(this._getDiscount(), this.canvas.width - rightMargin, topMargin + this.n(13))
  }

  renderProductPrice () {
    var leftPriceMargin = this.n(45)

    this.applyFontShadow(this.mock.fontShadowColor)

    /* Placing the product Price */
    this.context.font = 'bold ' + this.n(50) + 'pt ' + this.mock.fontName
    this.context.fillStyle = this.mock.fontColor
    var bottomPriceMargin = this.n(45 + (this.mock.priceBottomMargin || 0))
    this.context.fillText(this._getPrice(), leftPriceMargin, this.canvas.height - bottomPriceMargin)

    this.context.font = 'bold ' + this.n(20) + 'pt ' + this.mock.fontName
    this.context.fillStyle = this.mock.fontColor
    bottomPriceMargin = this.n(110 + (this.mock.priceBottomMargin || 0))
    this.context.fillText(this._getMsg(), leftPriceMargin + 5, this.canvas.height - bottomPriceMargin)
  }

  loadFont (callback) {
    if (this.mock.fontsLoaded) {
      callback()
    } else {
      new TypeFace()
        .setFonts([this.mock.fontName, this.mock.fontNameDiscount])
        .load((files) => {
          try {
            files.forEach((file) => {
              registerFont(file, { family: 'OpenSans', weight: 'bold' })
            })
          } catch (e) {
            console.error(e)
          }

          this.mock.fontsLoaded = true
          callback()
        })
    }
  }

  /* definePaddings () {
    this.padding = 0
    this.paddingTop = 0

    if (!this.product || this.product.associates) {
      // Define a negative top margin for product image
      var minSize = 600
      this.padding = this.n(this.productImage.width < minSize ? 450 : 190)
      this.paddingTop = this.n(this.productImage.width < minSize ? 150 : 10)
    }

    var dif = this.canvas.height - this.canvas.width

    if (dif > 100) {
      this.paddingTop = this.n(dif / 2.5)
    }

    if (this.mockSett.productTopMargin) {
      this.paddingTop += this.mockSett.productTopMargin
    }
  } */

  renderingImages () {
    // this.definePaddings()

    if (this.mock.backgroundImage) {
      // Carrega o fundo da imagem final
      this.drawImage(this.mock.backgroundImage, 0, 0, this.canvas.width, this.canvas.height)
    }

    var prodWidth = this.mock.widthProduct - (this.mock.productImgMargins.left - this.mock.productImgMargins.right)
    var prodHeight = this.mock.productImgMargins.square ? prodWidth : this.mock.heightProduct - (this.mock.productImgMargins.top - this.mock.productImgMargins.bottom)

    // Carrega a imagem do produto
    this.drawImage(
      this.productImage, // Image
      this.mock.productImgMargins.left, // Left
      this.mock.productImgMargins.top, // Top
      prodWidth, // Width
      prodHeight // Height
    )

    // Carrega a imagem do mockup (Sobreposição)
    this.drawImage(
      this.mock.mockupImage, // Image
      0, // Left
      this.canvas.height - this.mock.mockupImage.height, // Top
      this.canvas.width, // Width
      this.mock.mockupImage.height // Height
    )
  }

  drawImage (image, startDrawLeft, startDrawTop, width, height) {
    this.context.drawImage(image, startDrawLeft, startDrawTop, width, height)
  }

  initCanvas () {
    this.canvas = createCanvas(this.mock.width, this.mock.height)
    this.context = this.canvas.getContext('2d')
  }

  load () {
    this.loadSettings(() => {
      this.initCanvas()

      this.loadImages(() => {
        this.loadFont(() => {
          this.fillCanvasBackground()
          this.renderingImages()

          this.renderProductPrice()

          if (this.mock.showDiscount) {
            this.renderDiscount()
          }
          if (this.setOnFinishedListener) {
            this.setOnFinishedListener(this.canvas)
          }
        })
      })
    })
  }
}
