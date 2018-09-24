const Routes = require('../redirects/controller/routes.js');

module.exports = class LoginRoutes extends Routes{

  attach(){
    this._get('/login', (req, res) => {
      res.render('login');
    });

    this._post('/login', (req, res) => {
      var UsersProvider = require('../provider/UsersProvider.js');

      UsersProvider.login(req.body.userId, req.body.userAccess, (user, msg)=>{
        req.session.loggedUser = user;

        if (req.session.loggedUser) {
          res.status(200).send(req.session.loggedUser);
        } else {
          req.session = null;
          res.status(505).send(msg);
        }
      });
    });

  }
};
