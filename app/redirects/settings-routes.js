const Routes = require('../redirects/controller/routes.js');
const UsersProvider = require('../provider/user-provider.js');
const UsersHandler = require('../handler/user-handler.js');
const Setts = require('../bean/setts.js');

module.exports = class SettingsRoutes extends Routes{

  attach(){
    

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
