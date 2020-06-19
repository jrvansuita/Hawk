const ProductHandler = require('../handler/product-handler.js')
const ProductUrlProvider = require('../provider/product-url-provider.js')
const ProductMockupBuilder = require('../mockup/product-mockup-builder.js')
const File = require('../file/file.js')
const Zip = require('../file/zip.js')

var _productCache = {}

module.exports = class {
  constructor (mockId, skus) {
    this.mockId = mockId
    this.skus = skus
    this.folder = './front/_mockups/'
  }

  loadProduct (sku) {
    return new Promise((resolve, reject) => {
      if (_productCache[sku]) {
        resolve(_productCache[sku])
      } else {
        ProductHandler.getImage(sku, (product) => {
          if (product) {
            new ProductUrlProvider().from(product.url).then((onlineValues) => {
              product.online = onlineValues
              _productCache[sku] = product
              resolve(product)
            }).catch(e => {
              resolve(product)
            })
          } else {
            resolve(product)
          }
        })
      }
    })
  }

  loadProductImage (sku) {
    return new Promise((resolve, reject) => {
      this.loadProduct(sku)
        .then((product) => {
          new ProductMockupBuilder(this.mockId)
            .setProduct(product)
            .setOnFinishedListener((canva) => {
              resolve(canva)
            })
            .load()
        })
    })
  }

  _canvasToFile (sku, canvas, callback) {
    new File()
      .setName(sku + '.png')
      .setFolder(this.folder)
      .fromCanvas(canvas)
      .save(callback)
  }

  _zipFiles (files, callback) {
    new Zip()
      .setName('mockups')
      .setPath(this.folder)
      .setFiles(files)
      .setOnError(callback)
      .run(callback)
  }

  loadMultipleProductImages (skus) {
    return new Promise((resolve, reject) => {
      var files = []

      var load = (callback) => {
        var sku = skus[skus.length - 1]
        skus.pop()

        if (sku) {
          this.loadProductImage(sku).then((canvas) => {
            this._canvasToFile(sku, canvas, (file) => {
              files.push(file)
              load()
            })
          })
        } else {
          this._zipFiles(files, resolve)
        }
      }

      load()
    })
  }

  load () {
    if (Array.isArray(this.skus)) {
      return this.loadMultipleProductImages(this.skus)
    } else {
      return this.loadProductImage(this.skus)
    }
  }
}
