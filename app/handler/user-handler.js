const User = require('../bean/user.js');
const Err = require('../error/error.js');
const UsersProvider = require('../provider/UsersProvider.js');

module.exports = class UserHandler {

  static storeFromScreen(params, callback) {
    var actual = UsersProvider.get(params.id);

    var user = new User(parseInt(params.id),
      params.name,
      params.lastName,
      params.sector,
      params.avatar,
      params.access,
      params.full,
      params.active == false ? false : true,
      params.token ? params.token : actual.token ? actual.token : '');

      //Gravando as configurações
      Object.keys(params).forEach((key)=>{
        if (key.includes('sett')){
          var settCode = key.split('-')[1];
          user.setts[settCode] = params[key];
        }
      });

      //Se o Usuario não tem permissão para alterar as próprias configurações
      //Todas as configs não serão setadas. Elimitar o atributo setts para não sobreescrever tudo
      if (Object.keys(user.setts).length == 0){
        delete user.setts;
      }


      user.upsert((err, doc)=>{

      });

      callback(user.id);

      UsersProvider.addUser(user);
    }


    static delete(userId){
      User.findByKey(userId, (err, user)=>{
        user.remove();
        UsersProvider.remove(userId);
      });
    }


  };
