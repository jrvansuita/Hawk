const Routes = require('../redirects/controller/routes.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingHandler = require('../handler/picking-handler.js');

module.exports = class PickingRoutes extends Routes{

  attach(){
    this._get('/picking/achievements', (req, res) => {
      var PickingAchievGridBuilder = require('../builder/PickingAchievGridBuilder.js');
      var builder = new PickingAchievGridBuilder();
      builder.init(res.locals.loggedUser.full, (data) => {
          res.render('picking/picking-achiev', {
            data: data
          });
      });

      builder.build();
    });

    this._get('/picking/overview', (req, res) => {
      require('../builder/PickingChartBuilder.js').buildOverview(res.locals.loggedUser.full, function(charts) {
          res.render('picking/picking-chart', {
            charts: charts,
            page: req.originalUrl,
        });
      });
    });


    this._get('/picking/by-date', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());

      require('../builder/PickingChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
        res.render('picking/picking-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter : true
        });
      });
    });

    this._get('/picking', (req, res) => {
      TransportLaws.select(req.query.transp);
      UfLaws.select(req.query.uf);

      PickingHandler.init(() => {

        if (!res.headersSent){
          res.render('picking/picking', {
            pickingSales: PickingHandler.getPickingSales(),
            inprogress: InprogressLaws.object(),

            transportList: TransportLaws.getObject(),
            selectedTransp: req.query.transp,

            ufList: UfLaws.getObject(),
            selectedUf: req.query.uf,

            pendingSales: PendingLaws.getList(),
            donePickings: DoneLaws.getList(),
            blockedSales: BlockedLaws.list(),
            printPickingUrl: global.pickingPrintUrl
          });
        }
      });
    });

    this._get('/picking-sale', (req, res) => {
      TransportLaws.select(req.query.transp);
      UfLaws.select(req.query.uf);

      PickingHandler.handle(req.query.userid,  this._resp().redirect(res));
    });

    this._post(['/picking/toggle-block-sale'], (req, res) => {
      BlockedLaws.toggleBlock(req.body.saleNumber, req.session.loggedUser, req.body.reason, this._resp().redirect(res));
    });

    this._post('/picking-done-restart', (req, res, body, locals, session) => {
      PickingHandler.restart(session.loggedUser, req.body.sale, this._resp().redirect(res));
    });

    this._get('/print-picking-sale', (req, res, body, locals, session) => {
      const Print = require('../pdf/picking-sale-pdf.js');
      Print.load(req.query.userId, req.query.saleNumber, this._resp().redirect(res));
    });


  }
};
