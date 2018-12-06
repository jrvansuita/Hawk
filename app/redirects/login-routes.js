const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports = class LoginRoutes extends Routes{

  attach(){
    this._get('/login', (req, res) => {
      res.render('login');
    });

    this._get('/user', (req, res) => {
      var user = UsersProvider.get(req.query.userId);
      if (user){
        this._resp().sucess(res, user);
      }else{
        this._resp().error(res, 'Usuário não encontrado');
      }

    });

    this._post('/login', (req, res) => {



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
