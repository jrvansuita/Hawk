const Routes = require('./_route.js');
const ShippingOrderProvider = require('../provider/shipping-order-provider.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const TransportLaws = require('../laws/transport-laws.js');
const ShippingOrderHandler = require('../handler/shipping-order-handler.js');
const Enum = require('../bean/enumerator.js');
const SaleLoader = require('../loader/sale-loader.js');

module.exports = class ShippingOrderRoutes extends Routes {
  mainPath() {
    return '/shipping-order';
  }

  attach() {
    this.page('/list', async (req, res) => {
      res.locals.shippingListQuery = req.session.shippingListQuery;
      var transportList = {};
      transportList.transp = TransportLaws.getObject();
      transportList.icons = await Enum.on('TRANSPORT-IMGS').get(true);
      res.render('packing/shipping-order/shipping-order-list', { transportList: transportList });
    });

    this.get('/list-page', (req, res) => {
      req.session.shippingListQuery = req.query.query;
      ShippingOrderProvider.list(req.query.query, req.query.page, data => {
        this._resp().success(res, data);
      });
    });

    this.get('', async (req, res) => {
      var transports = await Enum.on('TRANSPORT-IMGS').get(true);
      if (req.query.number || req.query.id) {
        ShippingOrderProvider.get(req.query, async data => {
          res.render('packing/shipping-order/shipping-order', { shippingOrder: data, transports: transports });
        });
      } else {
        res.render('packing/shipping-order/shipping-order', { shippingOrder: null, transports: transports });
      }
    });

    this.get('/print', (req, res) => {
      ShippingOrderProvider.get(req.query, async data => {
        res.render('packing/shipping-order/shipping-order-print', { shippingOrder: data, transports: await Enum.on('TRANSPORT-IMGS').get(true) });
      });
    });

    this.post('/new', (req, res) => {
      new ShippingOrderHandler(res.locals.loggedUser).create(req.body.data, id => {
        ShippingOrderProvider.get({ id: id }, oc => {
          this._resp().success(res, oc);
        });
      });
    });

    this.post('/save', (req, res) => {
      try {
        new ShippingOrderHandler(res.locals.loggedUser)
          .setId(req.body.id)
          .setNfs(req.body.nfs)
          .save(data => {
            this._resp().success(res, data);
          });
      } catch (e) {
        this._resp().error(res, e);
      }
    });

    this.get('/nfe', (req, res) => {
      new EccosysProvider().nfe(req.query.number).go(nfResult => {
        this._resp().success(res, nfResult);
      });
    });

    this.post('/collected', (req, res) => {
      new ShippingOrderHandler(res.locals.loggedUser).setId(req.body.id).collected(data => {
        this._resp().success(res, data);
      });
    });

    this.get('/tracking', (req, res) => {
      new SaleLoader(req.query.sale)
        .setOnError(error => {
          this._resp().error(res, error);
        })
        .run(sale => {
          //Eliel, implementar aqui a solução buscar da data frete e retornar para o store front.
        });
    });
  }
};
