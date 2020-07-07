const Routes = require('./_route.js')
const EnumeratorVault = require('../vault/enumerator-vault.js')
const Enumerator = require('../bean/enumerator.js')

module.exports = class EnumeratorRoutes extends Routes {
  attach () {
    this._page('/enumerators', (req, res) => {
      Enumerator.findAll((_err, all) => {
        var selected = all.find((e) => {
          return e.id == req.query.id
        })

        res.render('enumerator/enumerators', { selected: selected || {}, all: all })
      })
    })

    /**
     * @api {get} /enum Enumerator
     * @apiGroup Enumerator
     * @apiParam {String} tag Enumerator tag
     * @apiParam {String} [keys] true if want to get it mapped
     */

    this._get('/enum', async (req, res) => {
      res.send((await Enumerator.on(req.query.tag).get(!!req.query.keys)))
    })._apiRead()

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
