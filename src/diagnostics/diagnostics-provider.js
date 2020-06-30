const Product = require('../bean/product.js')
const Fix = require('../bean/fix.js')
const Enum = require('../bean/enumerator.js')

module.exports = class DiagnosticsProvider {
  groupped (s) {
    this.doGroups = s
    return this
  }

  loadTypes (s) {
    this.doLoadTypes = s
    return this
  }

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
    Fix.findByType(type, (_err, all) => {
      callback(this.groupType(all))
    })
  }

  _groupSku (data) {
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

  async _loadTypes (data) {
    var result = []
    var fixesTypes = (await Enum.on('PROD-DIAG').get(true))
    data.forEach((each) => {
      var s = each.toObject()
      s.data = fixesTypes[each.type]
      result.push(s)
    })

    return result
  }

  prepare (data) {
    if (this.doLoadTypes) { data = this._loadTypes(data) }
    if (this.doGroups) { data = this._groupSku(data) }
    return data
  }

  loadBySku (sku, callback) {
    Product.get(sku, (product) => {
      Fix.findBySku(sku, (_err, data) => {
        callback(this.prepare(data), product)
      })
    })
  }

  findBySku (sku, callback) {
    Fix.findBySku(sku, (_err, data) => {
      callback(this.prepare(data))
    })
  }

  sums (callback) {
    Fix.sums(async (_err, data) => {
      callback(data, (await Enum.on('PROD-DIAG').get(true)))
    })
  }
}
