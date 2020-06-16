const Product = require('../bean/product.js')
const Fix = require('../bean/fix.js')
const Enum = require('../bean/enumerator.js')

module.exports = class DiagnosticsProvider {
  groupType (data) {
    var grouped = {}

    data.forEach((item) => {
      var skuFather = item.sku.split('-')[0]

      if (!grouped[skuFather]) {
        var isChild = item.sku.includes('-')

        grouped[skuFather] = {
          sku: skuFather,
          type: item.type,
          name: Util.getProductName(item.name, isChild),
          brand: Util.getProductBrand(item.name, isChild).trim()
        }
      }
    })

    return Object.values(grouped)
  }

  loadByType (type, callback) {
    Fix.findByType(type, (err, all) => {
      callback(this.groupType(all))
    })
  }

  groupSku (data) {
    var grouped = {}

    data.forEach((item) => {
      if (!grouped[item.sku]) {
        grouped[item.sku] = { sku: item.sku, fixes: [item.type] }
      } else {
        grouped[item.sku].fixes.push(item.type)
      }
    })

    return Object.values(grouped)
  }

  loadBySku (sku, callback) {
    Product.get(sku, (product) => {
      Fix.findBySku(sku, (err, all) => {
        callback(this.groupSku(all), product)
      })
    })
  }

  findBySku (sku, callback) {
    Fix.findBySku(sku, (err, data) => {
      callback(data)
    })
  }

  sums (callback) {
    Fix.sums((err, data) => {
      Enum.getMap('PROD-DIAG', (types) => {
        callback(data, types)
      })
    })
  }
}
