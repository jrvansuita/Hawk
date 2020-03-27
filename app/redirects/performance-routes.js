const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/user-provider.js');
const MaganePoints = require('../handler/manage-points-handler.js');
const SaleDashboardProvider = require('../provider/sale-dashboard-provider.js');

module.exports = class PerformanceRoutes extends Routes{

  attach(){

    this._get('/profiles', (req, res) => {
      this._resp().sucess(res,
        UsersProvider.getAllUsers()
      );
    }, true);

    this._page('/manage-points', (req, res) => {
      if (this._checkPermissionOrGoBack(req, res, 6)){
        res.render('performance/manage-points');
      }
    });

    this._page(['/profile'], (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());
      var userId = req.query.userid || req.session.loggedUserID;

      require('../provider/ProfilePerformanceProvider.js').onUserPerformance(
        from,
        to,
        userId,
        res.locals.loggedUser.full,
        function(user, charts, indicators) {
          res.render('performance/profile', {
            user: user,
            charts: charts,
            indicators: indicators,
            showCalendarFilter : true,
            hideEmptyCharts : true
          });
        });
      });

      this._post('/points', (req, res)=>{
        MaganePoints.balance(res.locals.loggedUser, req.body.data, this._resp().redirect(res));
      });


      this._post('/balance-packing-to-picking', (req, res)=>{
        MaganePoints.packingRemovingPointsFromPicker(res.locals.loggedUser, req.body.picker, req.body.points, req.body.saleNumber, this._resp().redirect(res));
      });

      this._page('/sales-dashboard', (req, res)=>{
        console.log(req.query);
        res.locals.salesDashQuery = req.query || req.session.salesDashQuery;
        SaleDashboardProvider.load(res.locals.salesDashQuery,(data) => {
          res.render('sale/sales-dashboard', {data: data});
        });
      });
      



    }



  };
