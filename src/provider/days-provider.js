const Day = require('../bean/day.js')
var UsersProvider = require('../provider/user-provider.js')

module.exports = class {
  constructor (type, callback) {
    this.data = {}
    this.type = type
    this.callback = callback
    this.groupBy = 'userId'
  }

  onFinished () {
    this.callback(this.data)
  }

  getDaysByUser (from, to, userId) {
    this.groupBy = 'date'
    this.get(from, to, userId)
  }

  get (from, to, userId) {
    var _self = this

    Day.findAndSort(this.buildQuery(from, to, userId), 'date', (err, items) => {
      _self.handle(items, 0)
    })
  }

  buildQuery (from, to, userId) {
    var query = {
      type: this.type,
      date: {
        $gte: from.begin(),
        $lte: to.end()
      }
    }

    if (userId > 0) {
      query.userId = userId
    }

    return query
  }

  handle (docs, index) {
    if (docs.length > 0) {
      var item = this.putGroupInfo(docs[index])
      this.handleItem(item)

      if (index < docs.length - 1) {
        this.handle(docs, ++index)
      } else {
        this.onFinished()
      }
    } else {
      this.onFinished()
    }
  }

  handleItem (item) {
    if (this.data[this.getGroupByValue(item)]) {
      this.data[this.getGroupByValue(item)].total += item.total
      this.data[this.getGroupByValue(item)].count += item.count
      this.data[this.getGroupByValue(item)].points += item.points
    } else {
      this.data[this.getGroupByValue(item)] = item
    }
  }

  getGroupByValue (item) {
    if (this.groupBy === 'date') {
      return Dat.api(item[this.groupBy])
    } else {
      return item[this.groupBy]
    }
  }

  putGroupInfo (item) {
    if (this.groupBy === 'userId') {
      item.user = UsersProvider.getDefault(item.userId, true)
    } else if (this.groupBy === 'date') {
      item.label = Dat.format(item.date).split('/')[0]
    }

    return item
  }
}
