const Routes = require('../redirects/_routes.js');


module.exports = class PendingRoutes extends Routes{

  attach(){

    var pickingProvider = new require('../provider/PickingProvider.js');

    this._get('/pending', (req, res) => {
      pickingProvider.onPending(()=>{
        res.render('pending',{
          wideOpen : true,
          pendingSales: pickingProvider.pendingSales()});
      });
    });

    this._post('/start-pending', (req, res, body) => {
      pickingProvider.storePendingSale(body.pendingSale, body.local, this._resp().redirect(res));
    });

    this._post('/pending-status', (req, res, body) => {
      pickingProvider.pendingStatus(body.pendingSale, this._resp().redirect(res)); 
    });

    this._post('/picking-pending-restart', (req, res, body, locals) => {
      pickingProvider.restartPendingSale(body.pendingSale, locals.loggedUser, this._resp().redirect(res));
    });


  }
};
