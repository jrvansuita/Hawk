const DataAccess = require('../mongoose/data-access')

module.exports = class StockOrder extends DataAccess {
  constructor (id, user, number, manufacturer, brand, season, year, date, attachs) {
    super()
    this.id = id || Util.id()
    this.status = 0
    this.user = user || {}
    this.date = Dat.def(date)
    this.number = Str.def(number)
    this.manufacturer = Str.def(manufacturer)
    this.brand = Str.def(brand)
    this.season = Str.def(season)
    this.year = Str.def(year)
    this.attachs = attachs || []
  }

  static getKey () {
    return ['id']
  }
}
