const Routes = require('../redirects/controller/routes.js');

module.exports = class PackingRoutes extends Routes{

  attach(){

    this._get(['/packing', '/packing/overview'], (req, res) => {
      require('../builder/InvoiceChartBuilder.js').buildOverview(res.locals.loggedUser.full, (charts)=> {
        res.render('invoice-chart', {
          charts: charts,
          page: req.originalUrl,
        });
      });
    });


    this._get('/packing/by-date', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());

      require('../builder/InvoiceChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
        res.render('invoice-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter : true
        });
      });
    });



    this._get('/packing/achievements', (req, res) => {
      var InvoiceAchievGridBuilder = require('../builder/InvoiceAchievGridBuilder.js');
      var builder = new InvoiceAchievGridBuilder();
      builder.init(res.locals.loggedUser.full,
        (data) => {
          res.render('invoice-achiev', {
            data: data
          });
        });

        builder.build();
      });

}};
