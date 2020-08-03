const StockOrder = require('../bean/stock-order')
const AttributesHandler = require('../handler/attributes-handler')
const DataAccess = require('../mongoose/data-access.js')

module.exports = class StockOrderProvider {
  _getSearchQueryFields() {
    return ['number', 'season', 'manufacturer', 'brand']
  }

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

  _filterOrders(orders) {
    var result = {}
    result.awaiting = orders?.filter((e) => { if (e.status === 0) return e })
    result.processing = orders?.filter((e) => { if (e.status === 1) return e })
    result.finished = orders?.filter((e) => { if (e.status === 2) return e })

    return result
  }

  search(query, callback) {
    if (query.page) {
      this.getOrdersPages(query, query.page, query.limit, callback)
    } else {
      StockOrder.find(this.getDataQuery(query), (_err, docs) => {
        callback(this._filterOrders(docs))
      })
    }
  }

  getDataQuery(query) {
    var and = []

    if (query.begin && query.end) {
      and.push(DataAccess.range('date', query.begin, query.end, true))
    }

    if (query.value && query.value.length) {
      and.push(DataAccess.or(this._getSearchQueryFields(), query.value))
    }

    return { $and: and }
  }

  getOrdersPages(query, page, limit, callback) {
    StockOrder.paginate({ status: query.status }, page, '-date', parseInt(limit), (_err, data) => {
      callback(this._filterOrders(data))
    })
  }
}
