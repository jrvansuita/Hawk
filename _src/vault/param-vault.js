
const Params = require('../bean/params.js')

global._mainParams = null

module.exports = {

  init (callback) {
    Params.findAll(function (_err, docs) {
      global._mainParams = docs[0].toObject()
      global.Params = require('../vars/params.js')
      callback()
    })
  },

  put (name, val) {
    if (global._mainParams) {
      global._mainParams[name] = val
    }

    new Params().put(name, val).save()
  }

}
