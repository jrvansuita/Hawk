const Routes = require('../redirects/controller/routes.js');
const PendingLaws = require('../laws/pending-laws.js');
const PendingHandler = require('../handler/pending-handler.js');
const SaleItemSwapper = require('../swap/sale-item-swapper.js');

module.exports = class PendingRoutes extends Routes{

  attach(){
    this._get('/pending', (req, res) => {
      PendingHandler.load(false, (list)=>{
        res.render('pending/pending', {
          wideOpen : true,
          pendingSales: list});
        });
      });

      this._post('/start-pending', (req, res, body, locals) => {
        PendingHandler.store(body.pendingSale, body.local, locals.loggedUser, this._resp().redirect(res));
      });

      this._post('/pending-status', (req, res, body, locals) => {
        PendingHandler.incStatus(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
      });

      this._post('/picking-pending-restart', (req, res, body, locals) => {
        PendingHandler.restart(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
      });

      this._post('/pending-swap-items', (req, res, body, locals) => {
        if (locals.loggedUser.full){
          new SaleItemSwapper(body.saleNumber, locals.loggedUser.id).on(body.targetSku).to(body.swapSku).go(this._resp().redirect(res));
        }else{
          this._resp().sucess(res, 'Você não tem permissão para função');
        }
      });

    }
  };
