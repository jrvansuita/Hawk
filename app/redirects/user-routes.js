const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/UsersProvider.js');
const UsersHandler = require('../handler/user-handler.js');
const Setts = require('../bean/setts.js');

module.exports = class UserRoutes extends Routes{

  attach(){
    this._get('/user', (req, res) => {
      var user = UsersProvider.get(req.query.userId);
      if (user){
        this._resp().sucess(res, user);
      }else{
        this._resp().error(res, 'Usuário ' + req.query.userId + ' não encontrado');
      }

    }, true);

    this._get('/user-form', (req, res) => {
      var user = UsersProvider.get(req.session.loggedUserID);

      if (!user || (req.query.userId && (user.full || (user.id == req.query.userId)))){
        user = UsersProvider.get(req.query.userId);
      }

      res.render('user/user-form',{user: user});
    }, true);

    this._page('/team-board', (req, res) => {
      res.render('performance/team-board',{data:  UsersProvider.getByGroup()});
    });

    this._post('/user-form', (req, res) => {
      UsersHandler.storeFromScreen(req.body, (userId)=>{
        res.redirect("/user-form?userId=" + userId);
      });
    }, true);

    this._post('/user-delete', (req, res) => {
      UsersHandler.delete(req.body.id);
      res.status(200).send('Ok');
    }, true);



    this._post('/upload-user-avatar', (req, res) => {
      UsersHandler.changeImage(req.body.userId, req.body.avatar, (url)=>{
        //Nada
      });

      res.status(200).send('OK');
    });



  }

};
