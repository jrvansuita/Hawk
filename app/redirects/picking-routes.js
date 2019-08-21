const Routes = require('../redirects/controller/routes.js');
const BlockHandler = require('../handler/block-handler.js');
const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingHandler = require('../handler/picking-handler.js');
const PickingSalePrint = require('../print/picking-sale-print.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports = class PickingRoutes extends Routes{

  attach(){
    this._page('/picking/records', (req, res) => {
      var builder = new (require('../builder/picking-records-builder.js'))();
      builder.init(res.locals.loggedUser.full, (data) => {
          res.render('picking/picking-records', {
            data: data
          });
      });

      builder.build();
    });

    this._page('/picking/overview', (req, res) => {
      require('../builder/PickingChartBuilder.js').buildOverview(res.locals.loggedUser.full, function(charts) {
          res.render('picking/picking-chart', {
            charts: charts,
            page: req.originalUrl,
        });
      });
    });


    this._page('/picking/by-date', (req, res) => {
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

    this._page('/picking', (req, res) => {
      TransportLaws.select(req.query.transp);
      UfLaws.select(req.query.uf);


      PickingHandler.init(() => {

        var pickingSales = PickingHandler.getPickingSales();

        if (!res.headersSent){
          res.render('picking/picking', {
            previewPickingSales: pickingSales.slice(0,3),
            previewSalesCount: pickingSales.length,
            totalSalesCount: PickingHandler.getPickingSalesTotalCount(),
            inprogress: InprogressLaws.object(),

            transportList: TransportLaws.getObject(),
            selectedTransps: TransportLaws.getSelecteds(),

            ufList: UfLaws.getObject(),
            selectedUfs: UfLaws.getSelecteds(),

            pendingSales: PendingLaws.getList(),
            donePickings: DoneLaws.getList(),
            blockedRules: BlockHandler.rules(),
            blockedSalesCount: BlockHandler.getBlockedSalesCount(),

            openSalesCount: PickingHandler.getOpenSalesCount()
          });
        }
      });
    });

    this._get('/picking-sale', (req, res) => {
      TransportLaws.select(req.query.transp);
      UfLaws.select(req.query.uf);

      PickingHandler.handle(req.query.userid,  this._resp().redirect(res));
    });

    this._post(['/picking/toggle-block'], (req, res) => {
      BlockHandler.toggle(req.body.blockNumber, req.session.loggedUserID, req.body.reasonTag, this._resp().redirect(res));
    });

    this._post(['/picking/block-pending'], (req, res) => {
      //var userId = req.body.userId ? req.body.userId : req.session.loggedUserID;
      //Sempre o responsavel vai ser o usuario logado.
      var userId = req.session.loggedUserID;
      
      BlockHandler.toggle(req.body.blockNumber, userId, req.body.reasonTag, ()=>{
        PendingLaws.remove(req.body.blockNumber);
        this._resp().redirect(res);
      });
    });

    this._post('/picking-done-restart', (req, res, body, locals, session) => {
      PickingHandler.restart(req.session.loggedUserID, req.body.sale, this._resp().redirect(res));
    });

    this._get('/print-picking-sale', (req, res, body, locals, session) => {

      new PickingSalePrint(req.query.saleNumber).setOnFinish((shell)=>{
        shell.setUser(UsersProvider.get(req.query.userId));

        res.render('picking/picking-print', {sale : shell});
      }).load();

    });


    this._get('/picking-line', (req, res, body, locals, session) => {
      const PickingLaws = require('../laws/picking-laws.js');
      const BlockLaws = require('../laws/block-laws.js');

      res.render('picking/line', {line : PickingLaws.getFullList(),
                                  blocks: BlockLaws.list(),
                                rules: BlockLaws.rules()});
    });




  }
};
