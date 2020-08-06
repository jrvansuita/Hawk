const Routes = require('./_route.js');

module.exports = class GeneralRoutes extends Routes {
  attach() {
    this.get('/john-travolta', (req, res) => {
      res.render('easter/john-travolta');
    });

    this.get('/restart', (req, res) => {
      process.exit(1);
    });

    this.get('/sub-menu', (req, res) => {
      res.render('menus/' + req.query.sub, { bgcolor: '#6058e4' });
    }).market();
  }
};
