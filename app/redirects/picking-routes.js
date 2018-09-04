const Routes = require('../redirects/_routes.js');


module.exports = class PerformanceRoutes extends Routes{

  attach(){
    this._get('/picking/achievements', (req, res) => {
      var PickingAchievGridBuilder = require('../builder/PickingAchievGridBuilder.js');
      var builder = new PickingAchievGridBuilder();
      builder.init(res.locals.loggedUser.full, (data) => {
          res.render('picking-achiev', {
            data: data
          });
      });

      builder.build();
    });

    var pickingProvider = new require('../provider/PickingProvider.js');

    this._get('/picking', (req, res) => {
      pickingProvider.init(req.query.transp,() => {

        if (!res.headersSent){
          res.render('picking', {
            upcoming: pickingProvider.upcomingSales(),
            remaining: pickingProvider.remainingSales(),
            inprogress: pickingProvider.inprogressPicking(),
            transportList: pickingProvider.getTransportList(),
            pendingSales: pickingProvider.pendingSales(),
            donePickings: pickingProvider.donePickings(),
            blockedSales: pickingProvider.blockedPickings(),
            selectedTransp: req.query.transp,
            printPickingUrl: global.pickingPrintUrl
          });
        }
      });
    });

    this._get('/picking/overview', (req, res) => {
      require('../builder/PickingChartBuilder.js').buildOverview(res.locals.loggedUser.full, function(charts) {
          res.render('picking-chart', {
            charts: charts,
            page: req.originalUrl,
        });
      });
    });


    this._get('/picking/by-date', (req, res) => {
      var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
      var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();

      require('../builder/PickingChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
        res.render('picking-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter : true
        });
      });
    });

    this._get('/picking-sale', (req, res) => {
          pickingProvider.handle(req.query.userid,  this._resp().redirect(res));
    });

    this._post(['/picking/toggle-block-sale'], (req, res) => {
        pickingProvider.toggleBlockedSale(req.body.saleNumber, req.session.loggedUser, this._resp().redirect(res));
    });

    this._post('/picking-done-restart', (req, res, body, locals, session) => {
      pickingProvider.restartDoneSale(session.loggedUser, req.body.sale, this._resp().redirect(res));
    });
  }
};
