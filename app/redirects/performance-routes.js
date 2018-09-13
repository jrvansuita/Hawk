const Routes = require('../redirects/_routes.js');


module.exports = class PerformanceRoutes extends Routes{

  attach(){

    this._get(['/profile/performance'], (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());
      var userId = req.query.userid || req.session.loggedUser.id;

      require('../provider/ProfilePerformanceProvider.js').onUserPerformance(
        from,
        to,
        userId,
        res.locals.loggedUser.full,
        function(user, charts, indicators) {
          res.render('profile-performance', {
            user: user,
            charts: charts,
            indicators: indicators,
            showCalendarFilter : true,
            hideEmptyCharts : true
          });
        });
      });
    }
  };
