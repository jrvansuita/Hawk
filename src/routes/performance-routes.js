const Routes = require('./_route.js')
const UsersProvider = require('../provider/user-provider.js')
const MaganePoints = require('../handler/manage-points-handler.js')
const SaleDashboardProvider = require('../provider/performance/sale-dashboard-provider.js')
const StockDashboardProvider = require('../provider/performance/stock-dashboard-provider.js')
const Cost = require('../bean/cost.js')

module.exports = class PerformanceRoutes extends Routes {
  attach () {
    this._get('/profiles', (req, res) => {
      this._resp().sucess(res,
        UsersProvider.getAllUsers()
      )
    }, true)

    this._page('/manage-points', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 6)) {
        res.render('performance/manage-points')
      }
    })

    this._page(['/profile'], (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth())
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth())
      var userId = req.query.userid || req.session.loggedUserID

      require('../provider/ProfilePerformanceProvider.js').onUserPerformance(
        from,
        to,
        userId,
        res.locals.loggedUser.full,
        function (user, charts, indicators) {
          res.render('performance/profile', {
            user: user,
            charts: charts,
            indicators: indicators,
            showCalendarFilter: true,
            hideEmptyCharts: true
          })
        })
    })

    this._post('/points', (req, res) => {
      MaganePoints.balance(res.locals.loggedUser, req.body.data, this._resp().redirect(res))
    })

    this._post('/balance-packing-to-picking', (req, res) => {
      MaganePoints.packingRemovingPointsFromPicker(res.locals.loggedUser, req.body.picker, req.body.points, req.body.saleNumber, this._resp().redirect(res))
    })

    /** Sale Dashboard Performance **/

    this._page('/sales-dashboard', (req, res) => {
      res.render('performance/sales-dashboard')
    })

    this._post('/sales-dashboard-data', (req, res) => {
      new SaleDashboardProvider()
        .with(req.body).maybe(req.session.salesDashQueryId)
        .setOnError((err) => {
          this._resp().error(res, err)
        })
        .setOnResult((result) => {
          req.session.salesDashQueryId = result.id
          this._resp().sucess(res, result)
        }).load()
    })

    this._post('/sales-dashboard-cost', (req, res) => {
      Cost.put(req.body.tag, req.body.val, (err, docs) => {
        this._resp().sucess(res, docs)
      })
    })

    /** Sale Dashboard Performance **/

    /** Stock Dashboard Performance **/
    this._page('/stock-dashboard', (req, res) => {
      res.render('performance/stock-dashboard')
    })

    this._post('/stock-dashboard-data', (req, res) => {
      new StockDashboardProvider()
        .with(req.body).maybe(req.session.stockDashQueryId)
        .setOnError((err) => {
          this._resp().error(res, err)
        })
        .setOnResult((result) => {
          req.session.stockDashQueryId = result.id
          this._resp().sucess(res, result)
        }).load()
    })
    /** Stock Dashboard Performance **/

    this._post('/stock-dashboard-delete', (req, res) => {
      new StockDashboardProvider()
        .with(req.body).delete((err, data) => {
          console.log(data)
          console.log(err)
          this._resp().sucess(res, data)
        })
    })
  }
}
