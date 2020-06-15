module.exports = class Cost extends DataAccess {
  constructor (id, data) {
    super()
    this.id = Num.def(id)
    this.data = data || {}
  }

  static getKey () {
    return ['id']
  }

  static getId (date) {
    return Dat.monthAndYear(date || new Date())
  }

  static getQuery (date) {
    return { id: Cost.getId(Dat.lastDayOfLastMonth()) }
  }

  static getCurrent (callback) {
    this.staticAccess()
      .findOne(Cost.getQuery(), callback)
  }

  static getRange (begin, end, callback) {
    var query = {
      id: {
        $gte: Cost.getId(new Date(parseInt(begin))),
        $lte: Cost.getId(new Date(parseInt(end)))
      }
    }

    this.staticAccess()
      .find(query, callback)
  }

  static put (tag, val, callback) {
    var set = {}
    set['data.' + tag] = val

    Cost.upsert(Cost.getQuery(), { $set: set }, (err, doc) => {
      if (callback) {
        callback(err, doc)
      }
    })
  }
}
