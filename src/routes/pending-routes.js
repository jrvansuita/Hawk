const Routes = require('./_route.js');
const PendingLaws = require('../laws/pending-laws.js');
const PendingHandler = require('../handler/pending-handler.js');
const SaleItemSwapper = require('../pending/sale-item-swapper.js');
const PendingVoucherHandler = require('../pending/pending-voucher-handler.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const PendingProductProvider = require('../provider/pending-product-provider.js');
const TemplateBuilder = require('../template/template-builder.js');
const SaleLoader = require('../loader/sale-loader.js');

module.exports = class PendingRoutes extends Routes {
  mainPath() {
    return '/pending';
  }

  attach() {
    this.page('', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 2)) {
        PendingHandler.load(false, (list) => {
          res.render('pending/pending', { pendingSales: list });
        });
      }
    });

    this.get('/print', (req, res) => {
      var list = PendingLaws.getFromStatus(req.query.status);

      var skus = list.map((p) => {
        return p.sale.items
          .map((i) => {
            return i.codigo;
          })
          .join(';');
      });

      new EccosysProvider().skus(skus).go((products) => {
        res.render('pending/print-list', {
          list: list,
          products: products,
          status: req.query.status,
        });
      });
    });

    this.post('/start', (req, res, body, locals) => {
      PendingHandler.store(body.pendingSale, body.local, body.pendingSale.pickUser, this._resp().redirect(res));
    });

    this.post('/status', (req, res, body, locals) => {
      PendingHandler.incStatus(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
    });

    this.post('/assume', (req, res, body, locals) => {
      PendingHandler.restart(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
    });

    this.post('/restart', (req, res, body, locals) => {
      PendingHandler.restart(body.pendingSale, body.pendingSale.sale.pickUser, this._resp().redirect(res));
    });

    this.post('/swap-items', (req, res, body, locals) => {
      new SaleItemSwapper(body.saleNumber, locals.loggedUser.id).on(body.targetSku).to(body.swapSku).with(body.quantity).go(this._resp().redirect(res));
    });

    this.post('/send-voucher', (req, res, body, locals) => {
      new PendingVoucherHandler(locals.loggedUser.id).with(body.pending, body.voucher, body.totalValue).go(this._resp().redirect(res));
    });

    this.get('/voucher-print', (req, res, body, locals) => {
      new SaleLoader(req.query.sale)
        .loadClient((sale) => {
          if (sale.observacoes) {
            var index = sale.observacoes.search('PEN');
            var voucher = sale.observacoes.slice(index);

            var data = { cliente: sale.client, oc: sale.numeroDaOrdemDeCompra, voucher: voucher };

            new TemplateBuilder('23975269').setData(data).build((template) => {
              res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': template.content.length,
              });
              res.end(template.content);
            });
          }
        })
        .run();
    });

    this.page('/products', (req, res, body, locals) => {
      new PendingProductProvider().load((list) => {
        res.render('pending/pending-products', { list: list });
      });
    });
  }
};
