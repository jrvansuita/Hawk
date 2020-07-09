const Routes = require('./_route.js')
const ShippingOrderProvider = require('../provider/shipping-order-provider.js')
const EccosysProvider = require('../eccosys/eccosys-provider.js')
const EccosysStorer = require('../eccosys/eccosys-storer.js')
const TransportLaws = require('../laws/transport-laws.js')
const Enum = require('../bean/enumerator.js')

module.exports = class ShippingOrderRoutes extends Routes {
  attach () {
    this._page('/packing/shipping-order-list', async (req, res) => {
      res.locals.shippingListQuery = req.session.shippingListQuery
      var transportList = {}
      transportList.transp = TransportLaws.getObject()
      transportList.icons = (await Enum.on('TRANSPORT-IMGS').get(true))
      res.render('packing/shipping-order/shipping-order-list', { transportList: transportList })
    })

    this._get('/shipping-order-list-page', (req, res) => {
      req.session.shippingListQuery = req.query.query
      ShippingOrderProvider.list(req.query.query, req.query.page, (data) => {
        this._resp().sucess(res, data)
      })
    })

    this._get('/packing/shipping-order', async (req, res) => {
      var transports = (await Enum.on('TRANSPORT-IMGS').get(true))
      if (req.query.number || req.query.id) {
        ShippingOrderProvider.get(req.query, async (data) => {
          res.render('packing/shipping-order/shipping-order', { shippingOrder: data, transports: transports })
        })
      } else {
        res.render('packing/shipping-order/shipping-order', { shippingOrder: null, transports: transports })
      }
    })

    this._get('/shipping-order-print', (req, res) => {
      ShippingOrderProvider.get(req.query, async (data) => {
        res.render('packing/shipping-order/shipping-order-print', { shippingOrder: data, transports: (await Enum.on('TRANSPORT-IMGS').get(true)) })
      })
    })

    this._post('/shipping-order-new', (req, res) => {
      new EccosysStorer().shippingOrder(res.locals.loggedUser).insert(req.body.data).go((data) => {
        var id = Num.extract(data)

        ShippingOrderProvider.get({ id: id }, (oc) => {
          this._resp().sucess(res, oc)
        })
      })
    })

    this._post('/shipping-order-save', (req, res) => {
      try {
        new EccosysStorer().shippingOrder(res.locals.loggedUser).update(req.body.id, req.body.nfs).go((data) => {
          this._resp().sucess(res, data)
        })
      } catch (e) {
        this._resp().error(res, e)
      }
    })

    this._get('/nfe', (req, res) => {
      new EccosysProvider().nfe(req.query.number).go(nfResult => {
        this._resp().sucess(res, nfResult)
      })
    })

    this._post('/shipping-order-colected', (req, res) => {
      new EccosysStorer().shippingOrder(res.locals.loggedUser).colected(req.body.id).go(r => {
        this._resp().sucess(res, r)
      })
    })
  }
}
