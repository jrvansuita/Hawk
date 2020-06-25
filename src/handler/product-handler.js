const EccosysProvider = require('../eccosys/eccosys-provider.js')
const EccosysStorer = require('../eccosys/eccosys-storer.js')
const Product = require('../bean/product.js')
const MagentoCalls = require('../magento/magento-calls.js')

module.exports = {

  get (eanOrSku, father, callback) {
    if (Num.isEan(eanOrSku)) {
      this.getByEan(eanOrSku, callback)
    } else {
      this.getBySku(eanOrSku, father, callback)
    }
  },

  getByEan (ean, callback) {
    new EccosysProvider().product(ean).go((eanProduct) => {
      if (!eanProduct) {
        handleCallback(callback, eanProduct, ean)
      } else {
        this.getBySku(getFatherSku(eanProduct.codigo), true, (product) => {
          handleCallback(callback, product, ean)
        })
      }
    })
  },

  getSkus (skus, idOrder, callback) {
    new EccosysProvider(false).skus(skus).go((products) => {
      idOrder ? callback(this._orderProducts(products)) : callback(products)
    })
  },

  getBySku (sku, father, callback) {
    new EccosysProvider(false).product(father ? getFatherSku(sku) : sku).go((product) => {
      handleCallback(callback, product, sku)
    })
  },

  getImage (sku, callback) {
    if (sku) {
      sku = getFatherSku(sku)
      var found = productsDataCache[sku]

      if (found) {
        callback(found)
      } else {
        Product.get(sku, (product) => {
          putAndControlDataCache(sku, product)

          callback(productsDataCache[sku])
        })
      }
    } else {
      callback()
    }
  },

  getStockHistory (sku, callback) {
    if (sku) {
      new EccosysProvider().stockHistory(sku).go((rows) => {
        callback(rows)
      })
    } else {
      callback()
    }
  },

  updateLocal (sku, newLocal, user, device, callback) {
    device = device || 'Desktop'

    this.getBySku(sku, false, (product) => {
      newLocal = newLocal.toUpperCase()

      // Reduzir a obs
      var lines = product.obs.split('\n')
      lines = lines.slice(lines.length - 15, lines.length)

      lines = lines.join('\n')

      var body = {
        codigo: product.codigo,
        localizacao: newLocal,
        obs: lines + '\n' + user.name + ' | ' + device + ' | ' + newLocal + ' | ' + Dat.format(new Date()) + '| Localização'
      }

      new EccosysStorer().product().update(body).go(callback)
    })
  },

  updateNCM (sku, newNCM, user, callback) {
    this.getBySku(sku, false, (product) => {
      newNCM = newNCM.trim()
      var lines = product.obs

      var body = {
        codigo: product.codigo,
        cf: newNCM,
        obs: lines + '\n' + user.name + ' | Desktop | ' + newNCM + ' | ' + Dat.format(new Date()) + '| NCM'
      }

      new EccosysStorer().product().update(body).go(callback)
    })
  },

  updateStock (sku, stock, user, device, callback) {
    device = device || 'Desktop'
    stock = !isNaN(parseInt(stock)) ? parseInt(stock) : 0

    /** Realiza a alteracao de estoque no eccosys **/
    this.getBySku(sku, false, (product) => {
      var body = {
        codigo: product.codigo,
        quantidade: Math.abs(stock),
        es: stock < 0 ? 'S' : 'E',
        obs: device + ' - ' + user.name,
        // Manter o mesmo preço
        custoLancamento: product.precoCusto,
        preco: product.preco
      }

      new EccosysStorer().stock(product.codigo, body).go(callback)
      /** Realiza a alteracao de estoque no eccosys **/

      /** Realiza a alteracao de estoque no magento **/
      if (global.Params.updateProductStockMagento()) {
        new MagentoCalls().productStock(product.codigo).then((data) => {
          if (data.length === 1) {
            var stockMagento = Math.max(parseFloat(data[0].qty) + stock, 0)
            new MagentoCalls().updateProductStock(product.codigo, stockMagento)
          }
        })
      }

      /** Realiza a alteracao de estoque no magento **/
    })
  },

  updateWeight (sku, weight, user, callback) {
    weight = Floa.floa(weight)

    this.getBySku(sku, false, (product) => {
      var lines = product.obs

      var body = {
        codigo: product.codigo,
        pesoLiq: Math.abs(weight),
        pesoBruto: Math.abs(weight),
        obs: lines + '\n' + user.name + ' | Desktop | ' + Floa.weight(weight) + ' | ' + Dat.format(new Date()) + '| Peso'
      }

      new EccosysStorer().product().update(body).go(callback)

      if (Params.updateProductWeightMagento()) {
        new MagentoCalls().updateProductWeight(product.codigo, weight)
      }
    })
  },

  active (sku, active, user, callback) {
    this.getBySku(sku, true, (product) => {
      var skus = [product ? product.codigo : sku]
      if (product && product._Skus && product._Skus.length > 0) {
        skus = skus.concat(product._Skus.map((s) => { return s.codigo }))
      }

      this.activeSingle(skus, active, user, callback)
    })
  },

  activeSingle (sku, active, user, callback) {
    new EccosysProvider().skus(sku).go((products) => {
      var body = []

      products.forEach((each) => {
        body.push({
          codigo: each.codigo,
          situacao: active ? 'A' : 'I',
          obs: each.obs + '\n' + user.name + ' | Desktop | ' + (active ? 'Ativo' : 'Inativo') + ' | ' + Dat.format(new Date()) + '| Situação'
        })
      })

      new EccosysStorer().product().update(body).go(callback)
    })
  },

  searchAutoComplete (typing, callback) {
    Product.likeThis(typing, 150, (err, products) => {
      callback(products)
    })
  },

  _orderProducts (products) {
    products = products.sort(function (a, b) {
      return decodeLetterSizeProduct(a.codigo.split('-')[1]) - decodeLetterSizeProduct(b.codigo.split('-')[1])
    })
    return products
  }

}

function handleCallback (callback, product, selected) {
  if (product) {
    product.selected = selected
  }
  callback(product)
}

function getFatherSku (sku) {
  return sku ? sku.split('-')[0] : sku
}

var productsDataCache = []

function putAndControlDataCache (sku, product) {
  if (product) {
    product = product.toObject()
    delete product.__v
    delete product._id

    productsDataCache[sku] = product

    var arr = Object.keys(productsDataCache)
    if (arr.length > 2000) {
      arr.slice(2000, arr.length - 1).forEach((i) => {
        delete productsDataCache[i]
      })
    }
  } else {
    productsDataCache[sku] = {}
  }
}

function decodeLetterSizeProduct (size) {
  var sizes = ['RN', 'P', 'M', 'G', 'GG', 'XXG']
  var index = sizes.indexOf(size)
  return Num.def(index > -1 ? (index - 100) : size)
}
