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

    this.provider = new RecordsProvider('picking')

    this.provider.onAddWinnersListener(function (row, item) {
      var winner = item.addWinner(row.user)

      winner.addBar('Segundos/Item', row.sum_count / row.sum_total, '5f7ce8')
      winner.addBar('Pontos', row.sum_points, '1da8b9', true)
      winner.addBar('Itens', row.sum_total, '03c184')
    })

    this.provider.onResultListener(function (resultData) {
      _self.finalCallback(resultData)
    })

    this.provider.load()
  }
}
