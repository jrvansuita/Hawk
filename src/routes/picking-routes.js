const Routes = require('./_route.js');
const BlockHandler = require('../handler/block-handler.js');
const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const PickingFilterLaws = require('../laws/picking-filter-laws.js');
const PickingSorterLaws = require('../laws/picking-sorter-laws.js');

const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingHandler = require('../handler/picking-handler.js');
const PickingSalePrint = require('../print/picking-sale-print.js');
const UsersProvider = require('../provider/user-provider.js');
const Enum = require('../bean/enumerator.js');

module.exports = class PickingRoutes extends Routes {
  mainPath() {
    return '/picking';
  }

  attach() {
    this.page('/records', (req, res) => {
      var builder = new (require('../builder/picking-records-builder.js'))();
      builder.init(res.locals.loggedUser.full, (data) => {
        res.render('picking/picking-records', {
          data: data,
        });
      });

      builder.build();
    });

    this.page('/overview', (req, res) => {
      require('../builder/picking-chart-builder.js').buildOverview(res.locals.loggedUser.full, function (charts) {
        res.render('picking/picking-chart', {
          charts: charts,
          page: req.originalUrl,
        });
      });
    });

    this.page('/by-date', (req, res) => {
      var from = global.Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = global.Dat.query(req.query.to, Dat.lastDayOfMonth());

      require('../builder/picking-chart-builder.js').buildByDate(from, to, res.locals.loggedUser.full, function (charts) {
        res.render('picking/picking-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter: true,
        });
      });
    });

    this.post('/reload', (req, res) => {
      PickingHandler.reloadPickingList(req.session.loggedUserID, req.body.ignoreDone, (result) => {
        this._resp().success(res, result);
      });
    });

    this.page('', (req, res) => {
      PickingSorterLaws.select(req.query.sort);
      PickingFilterLaws.select(req.query.filters);
      TransportLaws.select(req.query.transp);
      UfLaws.select(req.query.uf);

      PickingHandler.init(async () => {
        var pickingSales = PickingHandler.getPickingSales();

        if (!res.headersSent) {
          res.render('picking/picking', {
            previewPickingSales: pickingSales.slice(0, 3),
            previewSalesCount: pickingSales.length,
            totalSalesCount: PickingHandler.getPickingSalesTotalCount(),
            inprogress: InprogressLaws.object(),

            transportList: TransportLaws.getObject(),
            selectedTransps: TransportLaws.getSelecteds(),
            transportIcons: await Enum.on('TRANSPORT-IMGS').get(true),

            ufList: UfLaws.getObject(),
            selectedUfs: UfLaws.getSelecteds(),

            filters: PickingFilterLaws.getObject(),
            selectedFilters: PickingFilterLaws.getSelecteds(),

            sorterList: PickingSorterLaws.getObject(),
            sortSelected: PickingSorterLaws.getSelected(),

            pendingSales: PendingLaws.getList(),
            donePickings: DoneLaws.getList(),
            blockedRules: BlockHandler.rules(),
            blockedSalesCount: BlockHandler.getBlockedSalesCount(),

            openSalesCount: PickingHandler.getOpenSalesCount(),
            isBusy: PickingHandler.isBusy(),
          });
        }
      });
    });

    this.get('/sale', (req, res) => {
      PickingHandler.handle(req.query.userid, this._resp().redirect(res));
    });

    this.post('/toggle-block', (req, res) => {
      BlockHandler.toggle(req.body.blockNumber, req.session.loggedUserID, req.body.reasonTag, this._resp().redirect(res));
    });

    this.post('/block-pending', (req, res) => {
      // var userId = req.body.userId ? req.body.userId : req.session.loggedUserID;
      // Sempre o responsavel vai ser o usuario logado.
      var userId = req.session.loggedUserID;

      BlockHandler.toggle(req.body.blockNumber, userId, req.body.reasonTag, () => {
        PendingLaws.removeSale(req.body.blockNumber);
        res.status(200).send('OK');
      });
    });

    this.post('/done-restart', (req, res, body, locals, session) => {
      PickingHandler.restart(req.session.loggedUserID, req.body.sale, this._resp().redirect(res));
    });

    this.get('/print-sale', (req, res, body, locals, session) => {
      new PickingSalePrint(req.query.saleNumber)
        .setOnFinish((shell) => {
          shell.setUser(UsersProvider.get(req.query.userId));

          res.render('picking/picking-print', { sale: shell });
        })
        .load();
    });

    this.get('/line', (req, res, body, locals, session) => {
      const PickingLaws = require('../laws/picking-laws.js');
      const BlockLaws = require('../laws/block-laws.js');

      res.render('picking/line', {
        line: PickingLaws.getFullList(),
        blocks: BlockLaws.list(),
        rules: BlockLaws.rules(),

        selectedTransps: TransportLaws.getSelecteds(),
        selectedUfs: UfLaws.getSelecteds(),
        selectedFilters: PickingFilterLaws.getSelecteds(),
      });
    });
  }
};
