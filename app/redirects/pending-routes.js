const Routes = require('../redirects/controller/routes.js');
const PendingLaws = require('../laws/pending-laws.js');
const PendingHandler = require('../handler/pending-handler.js');
const SaleItemSwapper = require('../pending/sale-item-swapper.js');
const PendingVoucherHandler = require('../pending/pending-voucher-handler.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const BlockHandler = require('../handler/block-handler.js');
const PendingProductProvider = require('../provider/pending-product-provider.js');

module.exports = class PendingRoutes extends Routes{

  attach(){
    this._page('/pending', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 2)){
        PendingHandler.load(false, (list)=>{
          res.render('pending/pending', {
            pendingSales: list});
          });
        }
      });

      this._get('/pending-print-list', (req, res) => {

        var list = PendingLaws.getFromStatus(req.query.status);


        var skus = list.map((p)=>{
          return p.sale.items.map((i)=>{
            return i.codigo;
          }).join(';');
        });


        new EccosysProvider().skus(skus).go((products)=>{
          res.render('pending/print-list', {
            list: list,
            products : products,
            status : req.query.status
          });
        });


      });

      this._post('/start-pending', (req, res, body, locals) => {
        PendingHandler.store(body.pendingSale, body.local, body.pendingSale.pickUser, this._resp().redirect(res));
      });

      this._post('/pending-status', (req, res, body, locals) => {
        PendingHandler.incStatus(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
      });

      this._post('/pending-assume', (req, res, body, locals) => {
        PendingHandler.restart(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
      });

      this._post('/pending-restart', (req, res, body, locals) => {
        PendingHandler.restart(body.pendingSale, body.pendingSale.sale.pickUser, this._resp().redirect(res));
      });

      this._post('/pending-swap-items', (req, res, body, locals) => {
        new SaleItemSwapper(body.saleNumber, locals.loggedUser.id)
        .on(body.targetSku)
        .to(body.swapSku)
        .with(body.quantity)
        .go(this._resp().redirect(res));
      });

      this._post('/pending-send-voucher', (req, res, body, locals) => {
         new PendingVoucherHandler(locals.loggedUser.id)
         .with(body.pending, body.voucher, body.totalValue)
         .go(this._resp().redirect(res));
      });

      this._page('/pending-products', (req, res, body, locals) => {
        new PendingProductProvider().load((list)=>{
          res.render('pending/pending-products', {list: list});
        });
      });

    }
  };
