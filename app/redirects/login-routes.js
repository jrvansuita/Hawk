const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/UsersProvider.js');
const UsersHandler = require('../handler/user-handler.js');
const Setts = require('../bean/setts.js');

module.exports = class LoginRoutes extends Routes{

  attach(){
    this._get('/login', (req, res) => {
      res.render('login');
    }, true);

    this._get('/user', (req, res) => {
      var user = UsersProvider.get(req.query.userId);
      if (user){
        this._resp().sucess(res, user);
      }else{
        this._resp().error(res, 'Usuário não encontrado');
      }

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

    this._get('/user-form', (req, res) => {
      var user = UsersProvider.get(req.session.loggedUserID);

      if (req.query.userId && (user.full || (user.id == req.query.userId))){
        user = UsersProvider.get(req.query.userId);
      }

      res.render('user/user-form',{user: user});
    }, true);

    this._post('/user-form', (req, res) => {
      UsersHandler.storeFromScreen(req.body, (userId)=>{
        res.redirect("/user-form?userId=" + userId);
      });
    }, true);

    this._post('/user-delete', (req, res) => {
      UsersHandler.delete(req.body.id);
      res.status(200).send('Ok');
    }, true);

    this._get('/settings', (req, res) => {
      res.render('settings/settings');
    });

    this._get('/get-setts', (req, res) => {
      Setts.findAll((err, all)=>{
        res.status(200).send(all);
      });
    });

  }




};
