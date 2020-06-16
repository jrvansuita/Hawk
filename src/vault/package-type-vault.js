const Pack = require('../bean/pack.js')

module.exports = class {
  static storeFromScreen (params, callback) {
    var pack = new Pack(// parseInt(params.editing),
      params.name,
      params.height,
      params.width,
      params.length,
      params.weight,
      params.stockQtd,
      params.minStockQtd,
      params.maxWeight,
      params.lockSize === 'on')

    if (params.editingId.toString().length > 0) {
      pack._id = params.editingId
    }

    if (pack._id) {
      pack.upsert((_err, doc) => {
        callback(doc ? doc._id : 0)
      })
    } else {
      Pack.create(pack, (_err, doc) => {
        callback(doc ? doc._id : 0)
      })
    }
  }

  static delete (packId) {
    Pack.findOne({ _id: packId }, (_err, pack) => {
      pack.remove()
    })
  }

  static decPackStock (packId) {
    Pack.upsert({ _id: packId }, {
      $inc: {
        stockQtd: -1
      }
    }, (_err, doc) => {

    })
  }
}
