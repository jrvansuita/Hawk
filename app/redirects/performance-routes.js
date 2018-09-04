const Routes = require('../redirects/_routes.js');


module.exports = class PerformanceRoutes extends Routes{

  attach(){

    this._get(['/profile/performance'], (req, res) => {
      var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
      var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();
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
