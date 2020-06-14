var RecordsProvider = require('../provider/records-provider.js')
var Day = require('../bean/day.js')

module.exports = class {
  init (full, callback) {
    this.full = full
    this.finalCallback = callback
    this.data = []
  }

  build () {
    var _self = this

    this.provider = new RecordsProvider('invoice')
    this.provider.onAddWinnersListener(function (row, item) {
      var winner = item.addWinner(row.user)

      winner.addBar('Pedidos', row.sum_count, '09c8ca')
      winner.addBar('Pontos', row.sum_points, '6a73f7', true)
      if (_self.full) {
        winner.addBar('Receita', row.sum_total, '05c70d')
      }
    })

    this.provider.onResultListener(function (resultData) {
      _self.finalCallback(resultData)
    })

    this.provider.load()
  }
}
