const StockOrder = require('../bean/stock-order.js')

module.exports = class {
  static storeFromScreen(params, callback) {
    params.user = { name: params.user.name, avatar: params.user.avatar, id: params.user.id }

    var order = new StockOrder(params.user, params.number, params.manufacturer, params.brand, params.season, params.year, params.date)

    order.upsert((_err, doc) => {
      callback(doc)
    })
  }

  static delete(orderId, callback) {
    StockOrder.findByKey(orderId, (_err, order) => {
      order.remove()
      callback()
    })
  }
}