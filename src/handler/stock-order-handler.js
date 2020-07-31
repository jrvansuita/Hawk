const StockOrder = require('../bean/stock-order')

module.exports = class StockOrderHandler {
  updateStatus(orderId, user, callback) {
    user = { name: user.name, avatar: user.avatar, id: user.id }
    StockOrder.findByKey(orderId, (_err, order) => {
      order.status = order.status + 1
      order.user = user
      this.update(order, callback)
    })
  }

  update(order, callback) {
    StockOrder.upsert(StockOrder.getKeyQuery(order.id), order, (_err, doc) => {
      if (callback) {
        callback(doc)
      }
    })
  }
}
