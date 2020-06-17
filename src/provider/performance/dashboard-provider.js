const hash = require('object-hash')
const DataAccess = require('../../mongoose/data-access.js')

var temp = {}

class DashboardProviderHandler {
  maybe (sessionQueryId) {
    this.sessionQueryId = sessionQueryId
    return this
  }

  with (query) {
    this.query = query

    // Initializing
    this.query.begin = query.begin ? query.begin : Dat.today().begin().getTime()
    this.query.end = query.end ? query.end : Dat.today().end().getTime()

    return this
  }

  getDaysDif () {
    return Dat.daysDif(this.query.begin, this.query.end)
  }

  getDataQuery () {
    var and = []

    and.push(DataAccess.range('date', this.query.begin, this.query.end, true))

    if (this.query.value && this.query.value.length) {
      and.push(DataAccess.or(this._getSearchQueryFields(), this.query.value))
    }

    if (this.query.attrs) {
      Object.keys(this.query.attrs).forEach((key) => {
        and.push(DataAccess.or(key, this.query.attrs[key].split('|')))
      })
    }

    return { $and: and }
  }

  setOnResult (onResult) {
    this.onResult = onResult

    return this
  }

  setOnError (onError) {
    this.onError = onError
    return this
  }

  onGetData (callback) {
    // Not Implemented
  }

  load (callback) {
    if (this.onResult) {
      if (this.query.id && temp[this.query.id]) {
        // [cache] Tenta pegar pelo ID enviado
        this.onResult(temp[this.query.id])
      } else if ((Object.keys(this.query).length === 0) && this.sessionQueryId && temp[this.sessionQueryId]) {
        // [cache] Tenta pegar pelo ID em sessão
        this.onResult({ id: this.sessionQueryId })
      } else {
        var found = this._findByQueryHash()
        // [cache] Tenta pegar pelo hash da query
        if (found) {
          this.onResult(found)
        } else {
          // Busca do zero as informações
          this._onLoadData((err, data) => {
            if (err && this.onError) {
              this.onError(err)
            } else {
              this.onResult(this._keepTemp(data))
            }
          })
        }
      }
    }
  }

  _findByQueryHash () {
    return temp[hash(this.query)]
  }

  _keepTemp (data) {
    var id = hash(this.query)
    data = { id: id, query: this.query, data: data }
    temp[id] = data
    return data
  }
}

class DashboardProviderHelper {
  objectToArr (name, sortField) {
    sortField = sortField || 'count'

    if (this[name]) {
      this[name] = Object.values(this[name]).sort((a, b) => b[sortField] - a[sortField])
    }
  }

  handleArr (each, name, onCustom) {
    this.arrs[name] = true

    if (!this[name]) {
      this[name] = {}
    }
    var key = each[name] || 'Indefinido'

    var result = this[name][key] || {}

    result.name = key
    result.count = result.count ? result.count + 1 : 1
    result.total = result.total ? result.total + each.total : each.total

    if (onCustom) {
      onCustom(this, each, result)
    }

    this[name][key] = result
  }
}

module.exports = {
  Handler: DashboardProviderHandler,
  Helper: DashboardProviderHelper
}
