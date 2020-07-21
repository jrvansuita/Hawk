const EccosysProvider = require('../eccosys/eccosys-provider.js')
const Fix = require('../bean/fix.js')
const Product = require('../bean/product.js')

module.exports = class ProductDiagnostics {
  constructor () {
    this.productsAnalyzed = 0
    this.fixesFound = 0
    this.startTime = new Date()
  }

  _analizeProducts (product, stocks, callback) {
    this.productsAnalyzed++
    var attrBundle = getProductAttrBundle(product)

    // --- Cascata --- //
    if (isPhotoMissing(product)) {
      if (hasStock(product) || hasLocal(product)) {
        if (!hasSales(stocks)) {
          this._storeFix(product, 'NO_PHOTO')
        }
      } else {
        if (!hasSales(stocks)) {
          this._storeFix(product, 'REGISTERING')
        }
      }
    } else if (noLocalHasStock(product)) {
      this._storeFix(product, 'NO_LOCAL_HAS_STOCK')
    } else if (hasLocalNoStock(product, stocks)) {
      this._storeFix(product, 'HAS_LOCAL_NO_STOCK')
    } else if (isMoreThanXDaysRegistered(product, 3)) {
      if (!hasSales(stocks, 7)) {
        if (hasStock(product, true)) {
          if (!isVisible(product)) {
            this._storeFix(product, 'NOT_VISIBLE')
          }

          if (!isAssociated(product)) {
            this._storeFix(product, 'ASSOCIATED')
          } else if (isMoreThanXDaysRegistered(product, 25)) {
            this._storeFix(product, 'SALE')
          }
        } else {
          if (hasLockedStock(product) && !hasSales(stocks, 15)) {
            this._storeFix(product, 'LOCKED_STOCK')
          }
        }
      } else {
        if (!hasLockedStock(product)) {
          if (hasStock(product) && isMagentoProblem(product)) {
            this._storeFix(product, 'MAGENTO_PROBLEM')
          } else {
            if (!hasSales(stocks)) {
              this._storeFix(product, 'REGISTERING')
            }
          }
        }
      }
    }

    // --- Cascata --- //

    if (isWeightProblem(product, true)) {
      this._storeFix(product, 'WEIGHT')
    }

    if (isNcmProblem(product)) {
      this._storeFix(product, 'NCM')
    }

    if (isCostPriceMistake(product)) {
      this._storeFix(product, 'COST')
    }

    if(product?.feedProduct ==! undefined && product?.feedProduct?.quantity > 0){
        if (isBrandMissing(product, attrBundle.names)) {
            this._storeFix(product, 'BRAND')
          }
    }

    if (isColorMissing(attrBundle.names)) {
      this._storeFix(product, 'COLOR')
    }

    if (isDepartmentMissing(attrBundle.names)) {
      this._storeFix(product, 'DEPARTMENT')
    }

    if (isGenderMissing(attrBundle)) {
      this._storeFix(product, 'GENDER')
    }

    if (this.sendBroadcast) {
      this._emitBroadcast()
    }

    callback()
  }

  _storeFix (product, type) {
    Fix.put(product, type)
    this.fixesFound++
  }

  _emitBroadcast () {
    global.io.sockets.emit('product-diagnostics', {
      productsAnalyzed: this.productsAnalyzed,
      fixesFound: this.fixesFound,
      startTime: this.startTime
    })
  }

  _checkRangeSku (skus, index, callback) {
    this._checkSingleSku(skus[index], () => {
      index++

      if (skus.length > index) {
        this._checkRangeSku(skus, index, callback)
      } else {
        callback()
      }
    })
  }

  _checkSingleSku (sku, callback) {
    // Remove all from this sku
    Fix.removeAll({ sku: sku }, (err) => {
      // Capture the eccosys product
      new EccosysProvider()
        .product(sku)
        .go((product) => {
        // Product doesnt exists anymore Or is inactive
          if (!product || product.situacao == 'I') {
            callback()
          } else {
          // Capture feed product
            Product.get(sku, (feedProduct) => {
              product.feedProduct = feedProduct

              // Capture stock history
              new EccosysProvider()
                .limit(15)
                .order('DESC')
                .stockHistory(sku).go((stocks) => {
                  // Analyze the product
                  this._analizeProducts(product, stocks, () => {
                    callback()
                  })
                })
            })
          }
        })
    })
  }

  _loadCurrentProducts (list, callback) {
    var index = -1

    var next = () => {
      var item = list[++index]

      if (item) {
        if (item.gtin != '') {
          this._checkSingleSku(item.codigo, next)
        } else {
          next()
        }
      } else {
        callback()
      }
    }

    next()
  }

  _loadCurrentPage () {
    new EccosysProvider()
      .active()
      .dates(new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date(), 'data')
      .products()
      .pagging()
      .each((items, next) => {
        this._loadCurrentProducts(items, next)
      })
  }

  _loadChildProducts (sku, callback) {
    sku = sku.split('-')[0]

    new EccosysProvider()
      .product(sku).go((product) => {
        var skus = product._Skus ? product._Skus.map((i) => { return i.codigo }) : []
        callback(skus.length > 0 ? skus : [sku])
      })
  }

  _resyncStoredSkus (brandName, type) {
    var handler = (_err, docs) => {
      var skus = [...new Set(docs.map(i => i.sku))]

      this._checkRangeSku(skus, 0, () => {

      })
    }

    if (brandName) {
      Fix.findByBrand(brandName, type, handler)
    } else {
      Fix.findAll(handler)
    }
  }

  sync () {
    this.sendBroadcast = true
    this._loadCurrentPage()
  }

  refresh (byBrandName, type) {
    this.sendBroadcast = true
    this._resyncStoredSkus(byBrandName, type)
  }

  resync (sku, forceByFather, callback) {
    sku = sku.toString()

    if (forceByFather) {
      this._loadChildProducts(sku, (skus) => {
        this._checkRangeSku(skus, 0, () => {
          callback()
        })
      })
    } else {
      this._checkSingleSku(sku, () => {
        callback()
      })
    }
  }

  remove (sku) {
    // Remove all from this sku
    Fix.removeSkuAll(sku.toString(), (err) => {

    })
  }
}

function getProductAttrBundle (product) {
  var result = {
    names: product._Atributos.map((i) => { return i.descricao }),
    values: product._Atributos.map((i) => { return i.valor })
  }

  return result
}

function isWeightProblem (product, checkMagento) {
  // Considerar somente o peso liquido
  var isMissing = (parseFloat(product.pesoLiq) == 0) && !isPhotoMissing(product)

  if (!isMissing && checkMagento) {
    if (product.feedProduct && product.feedProduct.associates && product.feedProduct.weight) {
      var index = product.feedProduct.associates.split(',').findIndex((e) => { return e == product.codigo })
      var weight = Floa.def(product.feedProduct.weight.split(',')[index], 0)

      isMissing = weight == 0
    }
  }

  if (!isMissing) {
    isMissing = (parseFloat(product.pesoLiq) != parseFloat(product.pesoBruto)) || ((parseFloat(product.pesoLiq) + parseFloat(product.pesoBruto)) > 50)
  }

  return isMissing
}

function hasStock (product, checkAvailability) {
  return product._Estoque.estoqueReal > 0 && (!checkAvailability || (hasAvailableStock(product)))
}

function hasAvailableStock (product) {
  return product._Estoque.estoqueDisponivel > 0
}

function hasLockedStock (product) {
  return product._Estoque.estoqueDisponivel < product._Estoque.estoqueReal
}

function hasLocal (product) {
  return product.localizacao != ''
}

function noLocalHasStock (product) {
  return !hasLocal(product) && hasStock(product)
}

function hasLocalNoStock (product, stocks) {
  return hasLocal(product) && !hasStock(product) && !hasSales(stocks)
}

function isMagentoProblem (product) {
  return (!product.feedProduct) || (product.feedProduct && product.feedProduct.quantity == 0)
}

function isMoreThanXDaysRegistered (product, days) {
  return Dat.daysDif(product.dtCriacao, new Date()) > days
}

function isColorMissing (attrNames) {
  return !attrNames.includes('Cor')
}

function isBrandMissing (product, attrNames) {
  var check = !attrNames.includes('Marca') || !attrNames.includes('Fabricante')

  if (product.feedProduct) {
    check = check || !product.feedProduct.brand || !product.feedProduct.manufacturer
  }

  return check
}

function isCostPriceMistake (product) {
  var cost = parseFloat(product.precoCusto)
  var price = parseFloat(product.preco)

  return (cost === 0) || (price / cost < 1.2)
}

function isDepartmentMissing (attrNames) {
  return !attrNames.includes('Departamento')
}

function isGenderMissing (attrBundle) {
  var index = attrBundle.names.indexOf('Genero')
  var val = attrBundle.values[index]

  return index == -1 || !['Masculino', 'Feminino', 'Unissex', 'Unisex'].includes(val)
}

function isPhotoMissing (product) {
  return !product.feedProduct || !product.feedProduct.image
}

function hasSales (stocks, daysOffSales) {
  var filter = (i) => { return parseFloat(i.quantidade) < 0 && (parseInt(i.idOrigem) > 0) }

  if (daysOffSales) {
    var sales = stocks.filter(filter)

    if (sales.length > 0) {
      var lastSale = sales[0]
      return Dat.daysDif(lastSale.data, new Date()) <= daysOffSales
    } else {
      return false
    }
  }

  return stocks.some(filter)
}

function isNcmProblem (product) {
  var regexp = new RegExp('[0-9]{8}', 'g')
  return !product.cf || !regexp.test(Num.extract(product.cf))
}

function isVisible (product) {
  if (product.feedProduct) {
    if (product.feedProduct.visible !== true) {
      return false
    }
  }

  return true
}

function isAssociated (product) {
  if (product.feedProduct) {
    var arr = product.feedProduct.associates || product.feedProduct.sku
    if (arr || product.codigo.includes('-')) {
      return arr.includes(product.codigo) || (product.codigo == product.feedProduct.sku)
    }
  }

  return true
}
