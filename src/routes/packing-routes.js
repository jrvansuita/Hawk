const Routes = require('./_route.js')
const PackingHandler = require('../handler/packing-handler.js')
const PackingProvider = require('../provider/packing-provider.js')
const Pack = require('../bean/pack.js')
const PackageTypeVault = require('../vault/package-type-vault.js')
const PackingChartBuilder = require('../builder/packing-chart-builder.js')
const PackingDaysProvider = require('../provider/packing-days-provider.js')
const Enum = require('../bean/enumerator.js')

module.exports = class PackingRoutes extends Routes {
  attach () {
    this._page('/packing', (req, res) => {
      if (global.Sett.get(res.locals.loggedUser, 8)) {
        var result = async (sale) => {
          var icons = (await Enum.on('PAPERS-ICONS').get(true))

          if (sale.id) sale.status = ((await Enum.on('ECCO-SALE-STATUS').get(true)))
          res.render('packing/packing.ejs', {
            sale: sale,
            groups: { icons: icons, ...(!sale.id ? PackingProvider.get() : {}) }
          })
        }

        if (req.query.sale) {
          if (global.Num.isEan(req.query.sale)) {
            PackingHandler.findSaleFromEan(req.query.sale, (sale) => {
              result(sale)
            })
          } else {
            PackingHandler.findSale(req.query.sale, req.session.loggedUserID, (sale) => {
              result(sale)
            })
          }
        } else {
          result({})
        }
      } else {
        res.redirect('/packing/overview')
      }
    })

    this._post('/packing-done', (req, res) => {
      PackingHandler.done(req.body, res.locals.loggedUser, this._resp().redirect(res))
    })

    this._get('/packing-danfe', (req, res) => {
      req.setTimeout(3600000)
      PackingHandler.loadDanfe(res, req.query.nfe)
    }).skipLogin().cors()

    this._get('/packing-transport-tag', (req, res) => {
      req.setTimeout(3600000)
      PackingHandler.loadTransportTag(res, req.query.idnfe)
    })

    this._post('/packing-days', (req, res) => {
      var from = Dat.query(req.body.from, Dat.firstDayOfMonth())
      var to = Dat.query(req.body.to, Dat.lastDayOfMonth())
      var cache = !!(req?.body?.cache)

      PackingDaysProvider.get(from, to, cache, (data) => {
        if (cache) res.set('Cache-Control', 'public, max-age=86400')
        res.status(200).send(data)
      })
    })

    /** * End Packing Screen ****/

    this._page('/packing/overview', (req, res) => {
      PackingChartBuilder.buildOverview(res.locals.loggedUser.full, (charts) => {
        res.render('packing/packing-chart', {
          charts: charts,
          page: req.originalUrl
        })
      })
    })

    this._page('/packing/by-date', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth())
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth())

      PackingChartBuilder.buildByDate(from, to, res.locals.loggedUser.full, function (charts) {
        res.render('packing/packing-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter: true
        })
      })
    })

    this._page('/packing/records', (req, res) => {
      var builder = new (require('../builder/packing-records-builder.js'))()
      builder.init(res.locals.loggedUser.full,
        (data) => {
          res.render('packing/packing-records', {
            data: data
          })
        })

      builder.build()
    })

    /* --  Packing Types  -- */

    this._get('/package-types', (req, res) => {
      Pack.findAll((_err, all) => {
        res.status(200).send(all)
      })
    })

    this._get('/packages-registering', (req, res) => {
      Pack.findAll((_err, all) => {
        if (req.query._id) {
          Pack.findOne({ _id: req.query._id }, (_err, pack) => {
            res.render('packing/package-type-registering', { pack: pack, all: all })
          })
        } else {
          res.render('packing/package-type-registering', { pack: null, all: all })
        }
      })
    })

    this._post('/packages-registering', (req, res) => {
      PackageTypeVault.storeFromScreen(req.body, (packId) => {
        res.redirect('/packages-registering?_id=' + packId)
      })
    })

    this._post('/packages-remove', (req, res) => {
      PackageTypeVault.delete(req.body.id)
      res.status(200).send('Ok')
    })
  }
}
