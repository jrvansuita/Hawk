const Routes = require('./_route.js')
const UsersProvider = require('../provider/user-provider.js')
const MaganePoints = require('../handler/manage-points-handler.js')
const SaleDashboardProvider = require('../provider/performance/sale-dashboard-provider.js')
const StockDashboardProvider = require('../provider/performance/stock-dashboard-provider.js')
const Cost = require('../bean/cost.js')
const Enum = require('../bean/enumerator.js')

module.exports = class PerformanceRoutes extends Routes {
  attach () {
    this._get('/profiles', (req, res) => {
      this._resp().sucess(res,
        UsersProvider.getAllUsers()
      )
    }).skipLogin()

    this._page('/manage-points', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 6)) {
        res.render('performance/manage-points')
      }
    })

    this._page(['/profile'], (req, res) => {
      var from = global.Dat.query(req.query.from, Dat.firstDayOfMonth())
      var to = global.Dat.query(req.query.to, Dat.lastDayOfMonth())
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

    this._page('/sales-dashboard', async (req, res) => {
      res.render('performance/sales-dashboard', {
        paymentTypes: await Enum.on('PAY-TYPES').get(true)
      })
    })

    /**
     * @api {post} /sales-dashboard-data Sales Information
     * @apiGroup Performance
     *
     * @apiParam {String{2..200}} [value] Search for a product
     * @apiParam {Number} [begin=today] Date starts in 1592265600000
     * @apiParam {Number} [end=today] Date ends in 1592265600000
     * @apiParam {Object} [attrs] An object with categorized filters
     * @apiParamExample {json} Body-Example:
     * {
     *   "begin": 1592265600000
     *   "end": 1592265600000
     *   "value": "Transportadora Jadlog"
     *   "attrs" : {uf: "SP", city: "Osasco", paymentType: "creditcard"}
     * }
     *
     * @apiSuccessExample Success-Response:
     * HTTP/1.1 200 OK
     * {
     *   "avgCost" :10.83,
     *   "avgItems":6,
     *   "avgSell":25,
     *   "city":[...],
     *   "freight":2500
     *   "markup" : 2.3
     *   ... many others
     * }
     */
    this._post('/sales-dashboard-data', (req, res) => {
      new SaleDashboardProvider()
        .with(req.body, true).maybe(req.session.salesDashQueryId)
        .setOnError((err) => {
          this._resp().error(res, err)
        })
        .setOnResult((result) => {
          req.session.salesDashQueryId = result.id
          this._resp().sucess(res, result)
        }).load()
    })._api()

    this._post('/sales-dashboard-cost', (req, res) => {
      Cost.put(req.body.tag, req.body.val, (_err, docs) => {
        this._resp().sucess(res, docs)
      })
    })

    /** Sale Dashboard Performance **/

    /** Stock Dashboard Performance **/
    this._page('/stock-dashboard', (req, res) => {
      res.render('performance/stock-dashboard')
    })

    /**
     * @api {post} /stock-dashboard-data Stock Information
     * @apiGroup Performance
     *
     * @apiParam {String{2..200}} [value] Search for a product
     * @apiParam {Number} [begin=today] Date starts in 1592265600000
     * @apiParam {Number} [end=today] Date ends in 1592265600000
     * @apiParam {Number} [showSkus=25] Number of skus to get specific data.
     * @apiParam {Object} [attrs] An object with categorized filters
     * @apiParamExample {json} Body-Example:
     * {
     *   "begin": 1592265600000
     *   "end": 1592265600000
     *   "showSkus": 25
     *   "value": "coelinho"
     *   "attrs" : {season: "Inverno", brand: "Pugg"}
     * }
     *
     * @apiSuccessExample Success-Response:
     * HTTP/1.1 200 OK
     * {
     *   "count" :1210,
     *   "loadSkusCount":25,
     *   "total":1531,
     *   "items":65,
     *   "cost":629
     *   ... many others
     * }
     */

    this._post('/stock-dashboard-data', (req, res) => {
      new StockDashboardProvider()
        .with(req.body, true).maybe(req.session.stockDashQueryId)
        .setOnError((err) => {
          this._resp().error(res, err)
        })
        .setOnResult((result) => {
          req.session.stockDashQueryId = result.id
          this._resp().sucess(res, result)
        }).load()
    })._api()

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
