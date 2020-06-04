const Routes = require('./_route.js');
const UsersProvider = require('../provider/user-provider.js');
const Setts = require('../bean/setts.js');
const User = require('../bean/user.js');

module.exports = class LoginRoutes extends Routes{

  attach(){

    this._get('/login', (req, res) => {
      res.render('login/login');
    }, true);

    this._get('/wellcome', (req, res) => {
      res.render('login/wellcome');
    });

    this._post('/login', (req, res) => {
      var user;

      if (req.body.access == undefined){
        req.session.loggedUserID = 0;
      }else{
        UsersProvider.checkUserExists(req.body.access);
        user = UsersProvider.get(req.body.access);


        //Cria um password, caso não tenha nenhum para o usuário
        if (!user.pass){
          user.pass = req.body.pass;
          console.log(user);
          User.upsert({id: user.id}, user);
        }


        UsersProvider.checkUserPass(user, req.body.pass);

        UsersProvider.checkCanLogin(user, true);

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
