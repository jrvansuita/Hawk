const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports = class PerformanceRoutes extends Routes{

  attach(){

    this._get('/profiles', (req, res) => {
      this._resp().sucess(res,
        UsersProvider.getAllUsers()
      );
    });

    this._get('/manage-points', (req, res) => {
      res.render('performance/manage-points');
    });

    this._get(['/profile'], (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());
      var userId = req.query.userid || req.session.loggedUser.id;

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
        const MaganePoints = require('../handler/manage-points-handler.js');
        MaganePoints.balance(res.locals.loggedUser, req.body.data, this._resp().redirect(res));
      });
    }



  };
