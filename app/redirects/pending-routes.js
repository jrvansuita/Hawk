const Routes = require('../redirects/_routes.js');
const PendingLaws = require('../laws/pending-laws.js');
const PendingHandler = require('../handler/pending-handler.js');

module.exports = class PendingRoutes extends Routes{

  attach(){
    this._get('/pending', (req, res) => {
      PendingHandler.load(false, (list)=>{
        res.render('pending', {
          wideOpen : true,
          pendingSales: list});
      });
    });
 
    this._post('/start-pending', (req, res, body) => {
      PendingHandler.store(body.pendingSale, body.local, this._resp().redirect(res));
    });

    this._post('/pending-status', (req, res, body) => {
      PendingHandler.incStatus(body.pendingSale, this._resp().redirect(res));
    });

    this._post('/picking-pending-restart', (req, res, body, locals) => {
      PendingHandler.restart(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
    });


  }
};
