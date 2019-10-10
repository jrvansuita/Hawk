const Routes = require('../redirects/controller/routes.js');

module.exports = class GiftRoutes extends Routes{

  attach(){


    this._page('/gift-rules', (req, res) => {
      res.render('gift/gift-rules');
    });



  }

};
