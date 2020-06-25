
var cache = {}

module.exports = class Enumerator extends DataAccess {
  constructor (name, explanation, tag, items) {
    super()
    this.id = global.Util.id()
    this.name = global.Str.def(name)
    this.explanation = global.Str.def(explanation)
    this.tag = global.Str.def(tag)
    this.items = items || []

    // Every Item
    // -- icon, description, name, value, default:true||false}
  }

  static getKey () {
    return ['id']
  }

  setItems (items) {
    this.items = items
    return this
  }

  mapBy (mapProp) {
    this.mapProp = mapProp
    return this
  }

  async _get () {
    return new Promise((resolve, reject) => {
      if (cache[this.tag]) {
        resolve(cache[this.tag])
      } else {
        Enumerator.findOne({ tag: this.tag }, (_err, data) => {
          cache[this.tag] = data
          resolve(cache[this.tag])
        })
      }
    })
  }

  async _getMap () {
    return this.get().then((data) => {
      return data?.items?.reduce((o, item) => {
        o[item[this.mapProp || 'value']] = item
        return o
      }, {})
    })
  }

  static delete (id, callback) {
    this.findOne({ id: id }, (_err, obj) => {
      if (obj) { obj.remove() }

      callback()
    })
  }

  static duplicate (id, callback) {
    this.findOne({ id: id }, (_err, obj) => {
      new Enumerator('[Duplicado] ' + obj.name, obj.explanation, 'Nenhuma', obj.items).upsert((_err, doc) => {
        callback(doc)
      })
    })
  }

  static on (tag, useDef) {
    var e = new Enumerator()
    e.tag = tag
    e.useDef = useDef
    return e
  }

  async get (mapped) {
    return mapped ? this._getMap() : this._get()
  }

  async hunt (value, prop = 'name') {
    return this.get().then((data) => {
      var def
      var r = data?.items?.find((each) => {
        def = each.default ? each : def
        return each?.[prop]?.split(',')?.some((part) => {
          return part.trim() === value.trim()
        }) || (this.useDef ? def : null)
      })
      return r
    })
  }
}
