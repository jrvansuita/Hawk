const Product = require('../../bean/product.js')
const DashboardProvider = require('../performance/dashboard-provider.js')

module.exports = class ProductBoardProvider extends DashboardProvider.Handler {
  _getSearchQueryFields () {
    return ['sku', 'season', 'manufacturer', 'brand', 'category']
  }

  _onLoadData (callback) {
    Product.findAndSort(this.getDataQuery(), 'quantity', (_err, data) => {
      callback(_err, new ProductBoardHelper(data, this.query.showSkus))
    })
  }
}

class ProductBoardHelper extends DashboardProvider.Helper {
  constructor (data, loadSkusCount) {
    super()
    this.loadSkusCount = loadSkusCount || 25
    this.prepare(data)
  }

  prepare (data) {
    this.total = 0
    this.skusCount = data.length
    this.arrs = {}

    data.forEach((each) => {
      each.total = each.quantity
      this.total += each.quantity

      this.handleArr(each, 'season', this.handleCustom)
      this.handleArr(each, 'category', this.handleCustom)
      this.handleArr(each, 'brand', this.handleCustom)
      this.handleArr(each, 'color', this.handleCustom)
      this.handleArr(each, 'manufacturer', this.handleCustom)
      this.handleArr(each, 'gender', this.handleCustom)
      this.handleArr(each, 'year', this.handleCustom)
      this.handleArr(each, 'sku', this.handleCustomSku)
    })

    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name, 'total')
    })

    if (this.sku) {
      if (this.order === 'asc') this.sku.reverse()
      this.skusCount = this.sku.length
      this.sku.splice(this.loadSkusCount)
    }

    delete this.arrs
    return this
  }

  handleCustomSku (self, item, result) {
    result.manufacturer = item.manufacturer
  }

  handleCustom (self, item, result) {
    result.balance = result.balance ? result.balance + item.newStock : item.newStock
  }
}
