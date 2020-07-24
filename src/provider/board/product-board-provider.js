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

    this.smallestCost = data[0].cost
    this.gretterCost = data[0].cost
    this.smallestPrice = data[0].price
    this.gretterPrice = data[0].price

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

      this.handleCustomTotals(each)
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

  handleCustomTotals (item) {
    if (item.cost < this.smallestCost) this.smallestCost = item.cost
    if (item.cost > this.gretterCost) this.gretterCost = item.cost
    if (item.price < this.smallestPrice) this.smallestPrice = item.price
    if (item.price > this.gretterPrice) this.gretterPrice = item.price
    return this
  }

  handleCustomSku (self, item, result) {
    result.manufacturer = item.manufacturer
  }

  handleCustom (self, item, result) {
    result.balance = result.balance ? result.balance + item.newStock : item.newStock
  }
}