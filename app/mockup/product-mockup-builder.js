const { createCanvas, loadImage, registerFont } = require('canvas')
const TypeFace = require('../typeface/typeface.js')
const Mock = require('../bean/mock.js')

module.exports = class {
  constructor (id) {
    this.mockId = id
  }

  setProduct (product) {
    this.product = product
    return this
  }

  setOnFinishedListener (listener) {
    this.setOnFinishedListener = listener
    return this
  }

  loadImages (callback) {
    // Load the product image
    loadImage(this._geProductImage()).then((image) => {
      this.productImage = image

      // Load the mockup imaage
      loadImage(this.mockSett.imgUrl).then((image) => {
        this.mockupImage = image

        if (this.mockSett.backUrl) {
          // Load the mockup background imaage
          loadImage(this.mockSett.backUrl).then((image) => {
            this.backgroundImage = image

            callback()
          })
        } else {
          callback()
        }
      })
    })
  }

  loadSettings (callback) {
    this.mockSett = {}

    Mock.findOne({ _id: this.mockId }, (err, mock) => {
      this.mockSett = mock
      callback()
    })
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
    var msg = this.mockSett.msg
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
    this.context.fillStyle = this.mockSett.discountBackground == 'none' ? this._getDiscountBackgroundColor() : this.mockSett.discountBackground
    this.context.shadowColor = this.mockSett.discountBackgroundShadow
    this.context.shadowBlur = 10
    this.context.shadowOffsetX = 5
    this.context.shadowOffsetY = 5
    this.context.fill()

    rightMargin += this.n(this._getDiscount().length * 16)
    this.context.font = 'bold ' + this.n(30) + 'pt ' + this.mockSett.fontNameDiscount
    this.context.fillStyle = this.mockSett.discountFontColor
    this.applyFontShadow(this.mockSett.discountShadowColor)
    this.context.fillText(this._getDiscount(), this.canvas.width - rightMargin, topMargin + this.n(13))
  }

  renderProductPrice () {
    var leftPriceMargin = this.n(45)

    this.applyFontShadow(this.mockSett.fontShadowColor)

    /* Placing the product Price */
    this.context.font = 'bold ' + this.n(50) + 'pt ' + this.mockSett.fontName
    this.context.fillStyle = this.mockSett.fontColor
    var bottomPriceMargin = this.n(45 + (this.mockSett.priceBottomMargin || 0))
    this.context.fillText(this._getPrice(), leftPriceMargin, this.canvas.height - bottomPriceMargin)

    this.context.font = 'bold ' + this.n(20) + 'pt ' + this.mockSett.fontName
    this.context.fillStyle = this.mockSett.fontColor
    bottomPriceMargin = this.n(110 + (this.mockSett.priceBottomMargin || 0))
    this.context.fillText(this._getMsg(), leftPriceMargin + 5, this.canvas.height - bottomPriceMargin)
  }

  loadFont (callback) {
    new TypeFace()
      .setFonts([this.mockSett.fontName, this.mockSett.fontNameDiscount])
      .load((files) => {
        try {
          files.forEach((file) => {
            registerFont(file, { family: 'OpenSans', weight: 'bold' })
          })
        } catch (e) {

        }

        if (callback) {
          callback()
        }
      })
  }

  definePaddings () {
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
  }

  renderingImages () {
    this.definePaddings()

    if (this.backgroundImage) {
      this.context.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height)
    }

    this.context.drawImage(this.productImage, this.padding / 2, this.paddingTop, this.mockSett.width - this.padding, this.mockSett.width - this.padding)
    this.context.drawImage(this.mockupImage, 0, this.canvas.height - this.mockupImage.height, this.canvas.width, this.mockupImage.height)
  }

  initCanvas () {
    this.canvas = createCanvas(this.mockSett.width, this.mockSett.height)
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

          if (this.mockSett.showDiscount) {
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
