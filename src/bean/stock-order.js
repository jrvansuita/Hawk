const DataAccess = require('../mongoose/data-access')

module.exports = class StockOrder extends DataAccess {
  constructor (user, number, manufacturer, brand, session, year) {
    super()
    this.status = 0
    this.user = user || {}
    this.date = Dat.today()
    this.number = Str.def(number)
    this.manufacturer = Str.def(manufacturer)
    this.brand = Str.def(brand)
    this.session = Str.def(session)
    this.year = Str.def(year)
  }

  static getKey () {
    return ['number']
  }
}
