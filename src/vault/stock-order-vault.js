const StockOrder = require('../bean/stock-order.js')
const GDriveUpload = require('../gdrive/gdrive-api')

module.exports = class {
  static storeFromScreen(params, callback) {
    params.attachs = Array.isArray(params.attachs) ? params.attachs : params.attachs.split(',')

    params.user = { name: params.user.name, avatar: params.user.avatar, id: params.user.id }

    var order = new StockOrder(params.id, params.status, params.user, params.number, params.manufacturer, params.brand, params.season, params.year, new Date(params.date), params.attachs)

    order.upsert((_err, doc) => {
      callback(doc)
    })
  }

  static delete(orderId, callback) {
    console.log(orderId)
    StockOrder.findByKey(orderId, (_err, order) => {
      order.remove()
      callback()
    })
  }

  static uploadAttach(file, callback) {
    new GDriveUpload().setMedia(file).upload(callback)
  }
}
