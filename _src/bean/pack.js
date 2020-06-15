module.exports = class Pack extends DataAccess {
  constructor (/* id, */ name, height, width, length, weight, stockQtd, minStockQtd, maxWeight, lockSize) {
    super()
    // this.id = Num.def(id, 0);
    this.name = Str.def(name, 'Pacote Genérico')
    this.width = Num.def(width)
    this.height = Num.def(height)
    this.length = Num.def(length)
    this.weight = Floa.def(weight)
    this.stockQtd = Num.def(stockQtd)
    this.maxWeight = Floa.def(maxWeight)
    this.minStockQtd = Num.def(minStockQtd)
    this.lockSize = !!lockSize
  }

  static getKey () {
    return ['_id']
  }
}
