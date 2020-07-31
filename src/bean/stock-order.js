const DataAccess = require('../mongoose/data-access')

module.exports = class StockOrder extends DataAccess {
  constructor (id, user, number, manufacturer, brand, season, year, date) {
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
  }

  static getKey () {
    return ['id']
  }

  // static likeQuery(value) {
  //   if (!value) {
  //     return {}
  //   }

  //   return {
  //     $or: [
  //       {
  //         number: {
  //           $regex: value,
  //           $options: 'i'
  //         }
  //       },

  //       {
  //         manufacturer: {
  //           $regex: value,
  //           $options: 'i'
  //         }
  //       },
  //       {
  //         brand: {
  //           $regex: value,
  //           $options: 'i'
  //         }
  //       },
  //       {
  //         season: {
  //           $regex: value,
  //           $options: 'i'
  //         }
  //       },
  //       {
  //         year: {
  //           $regex: value,
  //           $options: 'i'
  //         }
  //       }
  //     ]
  //   }
  // }
}
