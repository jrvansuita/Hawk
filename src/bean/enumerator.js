
var cache = {}

module.exports = class Enumerator extends DataAccess {
  constructor (name, explanation, tag, items) {
    super()
    this.id = Util.id()
    this.name = Str.def(name)
    this.explanation = Str.def(explanation)
    this.tag = Str.def(tag)
    this.items = items || []

    // Every Item
    // -- icon, description, name, value, default:true||false}
  }

  setItems (items) {
    this.items = items
    return this
  }

  static getKey () {
    return ['id']
  }

  static get (tagOrId, callback) {
    if (cache[tagOrId]) {
      callback(cache[tagOrId])
    } else {
      this.findOne((typeof tagOrId === 'number') ? { id: tagOrId } : { tag: tagOrId }, (err, data) => {
        cache[tagOrId] = data
        callback(data)
      })
    }
  }

  static getKeyItems (tag, callback) {
    this.get(tag, (data) => {
      callback(data.items.reduce((o, item) => {
        o[item.value] = item
        return o
      }, {}))
    })
  }

  static delete (id, callback) {
    this.findOne({ id: id }, (err, obj) => {
      if (obj) { obj.remove() }

      callback()
    })
  }

  static duplicate (id, callback) {
    this.findOne({ id: id }, (err, obj) => {
      new Enumerator('[Duplicado] ' + obj.name, obj.explanation, 'Nenhuma', obj.items).upsert((err, doc) => {
        callback(doc)
      })
    })
  }

  static on (tag, useDef) {
    return {
      async get () {
        return new Promise((resolver) => {
          Enumerator.get(tag, (data) => {
            resolver(data)
          })
        })
      },

      async hunt (value, prop = 'name') {
        return this.get(tag).then((data) => {
          var def
          var r = data?.items?.find((each) => {
            def = each.default ? each : def
            return each?.[prop]?.split(',')?.some((part) => {
              return part.trim() == value.trim()
            }) || (useDef ? def : null)
          })
          return r
        })
      }
    }
  }
}
