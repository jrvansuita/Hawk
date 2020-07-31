const StockOrder = require('../bean/stock-order')
const AttributesHandler = require('../handler/attributes-handler')

module.exports = class StockOrderProvider {
  get(query, callback) {
    StockOrder.find(query, callback)
  }

  getAll(callback) {
    StockOrder.findAll((_err, orders) => {
      callback(this._filterOrders(orders))
    })
  }

  searchAttr(description, callback) {
    new AttributesHandler().filter(description).load(callback)
  }

  _filterOrders(orders, callback) {
    var result = {}
    result.awaiting = orders.filter((e) => { if (e.status === 0) return e })
    result.processing = orders.filter((e) => { if (e.status === 1) return e })
    result.finished = orders.filter((e) => { if (e.status === 2) return e })

    return result
  }

  search(query, callback) {
    StockOrder.find(StockOrder.likeQuery(query), (_err, doc) => {
      callback(this._filterOrders(doc))
    })
  }
}
