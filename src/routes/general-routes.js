const Routes = require('./_route.js');

module.exports = class GeneralRoutes extends Routes {
  attach() {
    this._get('/john-travolta', (req, res) => {
      res.render('easter/john-travolta');
    });

    this._get('/restart', (req, res) => {
      process.exit(1);
    });

    this._get('/sub-menu', (req, res) => {
      res.render('menus/' + req.query.sub, { bgcolor: '#6058e4' });
    });
  }
};
