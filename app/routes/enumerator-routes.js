const Routes = require('./_route.js')
const EnumeratorVault = require('../vault/enumerator-vault.js')
const Enumerator = require('../bean/enumerator.js')

module.exports = class EnumeratorRoutes extends Routes {
  attach () {
    this._page('/enumerators', (req, res) => {
      Enumerator.findAll((err, all) => {
        var selected = all.find((e) => {
          return e.id == req.query.id
        })

        res.render('enumerator/enumerators', { selected: selected || {}, all: all })
      })
    })

    this._get('/enum', (req, res) => {
      var find = Num.def(req.query.id, 0) || req.query.tag

      if (req.query.keys) {
        Enumerator.getKeyItems(find, data => { res.send(data) })
      } else {
        Enumerator.get(find, data => { res.send(data) })
      }
    })

    this._post('/enumerators', (req, res) => {
      EnumeratorVault.storeFromScreen(req.body, (id) => {
        res.status(200).send(id.toString())
      })
    })

    this._post('/enumerators-delete', (req, res) => {
      Enumerator.delete(req.body.id, () => {
        res.sendStatus(200)
      })
    })

    this._post('/enumerators-duplicate', (req, res) => {
      Enumerator.duplicate(req.body.id, (data) => {
        res.send(data)
      })
    })
  }
}
