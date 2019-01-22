const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/UsersProvider.js');
const UsersHandler = require('../handler/user-handler.js');
const Setts = require('../bean/setts.js');

module.exports = class LoginRoutes extends Routes{

  attach(){
    this._get('/login', (req, res) => {
      res.render('login');
    }, true);

 
    this._post('/login', (req, res) => {
      var user;

      if (req.body.userAccess == undefined){
        req.session.loggedUserID = 0;
      }else{
        UsersProvider.checkUserExists(req.body.userAccess);
        user = UsersProvider.get(req.body.userAccess);
        req.session.loggedUserID = user.id;
      }

      if (user) {
        res.status(200).send(user);
      } else {
        req.session = null;
        res.status(200).send(null);
      }

    }, true);

  }




};
