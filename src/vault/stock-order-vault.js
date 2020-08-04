const StockOrder = require('../bean/stock-order.js')
const GDriveUpload = require('../gdrive/gdrive-api')

module.exports = class {
  static storeFromScreen(params, callback) {
    console.log(params);
    params.user = { name: params.user.name, avatar: params.user.avatar, id: params.user.id }

    var order = new StockOrder(params.id, params.user, params.number, params.manufacturer, params.brand, params.season, params.year, new Date(params.date))

    // if (params.attach) {
    //   new GDriveUpload()
    //     .setMedia(params.attach, params.attach, 'image/png')
    //     .go((id) => {
    //     console.log(id);
    //   })
    // }
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
}
