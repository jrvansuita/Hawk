const Routes = require('../redirects/controller/routes.js');
const PendingLaws = require('../laws/pending-laws.js');
const PendingHandler = require('../handler/pending-handler.js');
const SaleItemSwapper = require('../swap/sale-item-swapper.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports = class PendingRoutes extends Routes{

  attach(){
    this._page('/pending', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 2)){
        PendingHandler.load(false, (list)=>{
          res.render('pending/pending', {
            wideOpen : true,
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


        new EccosysCalls().getSkus(skus, (products)=>{
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

      this._post('/picking-pending-restart', (req, res, body, locals) => {
        PendingHandler.restart(body.pendingSale, body.pendingSale.status == 2 ? locals.loggedUser : body.pendingSale.sale.pickUser, this._resp().redirect(res));
      });

      this._post('/pending-swap-items', (req, res, body, locals) => {
        //if (locals.loggedUser.full){
        new SaleItemSwapper(body.saleNumber, locals.loggedUser.id)
        .on(body.targetSku)
        .to(body.swapSku)
        .with(body.quantity)
        .go(this._resp().redirect(res));
        //}else{
        //          this._resp().error(res, 'Você não tem permissão para função');
        //      }
      });

    }
  };
