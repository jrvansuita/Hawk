const User = require('../bean/user.js');
const Err = require('../error/error.js');

module.exports = class UsersProvider {

  static loadAllUsers(callback) {
    global._cachedUsers = {};
    User.findAll(function(err, users) {
      users.forEach(function(user, doc) {
        global._cachedUsers[user.id] = user['_doc'];
      });

      callback();
    });
  }

  static getAllUsers() {
    if (!global._cachedUsers) {
      this.loadAllUsers();
    } else {
      return global._cachedUsers;
    }
  }

  static store(user) {
    if (global._cachedUsers[user.id] === undefined) {
      user.upsert();

      global._cachedUsers[user.id] = user;
    }
  }

  static addUser(user){
    global._cachedUsers[user.id] = user;
  }

  static remove(userId){
    delete global._cachedUsers[userId];
  }

  static get(code) {
    if (code !== undefined){
      if(global._cachedUsers[code]){
        return global._cachedUsers[code];
      }else{
        for (var key in global._cachedUsers) {
          if (global._cachedUsers.hasOwnProperty(key)) {

            if (global._cachedUsers[key].access === code){
              return global._cachedUsers[key];
            }
          }
        }
      }
    }

    return undefined;
  }


  static checkCanLogin(user, _throw) {
    var result = user.active;

    if (result && !user.full){
      var range = Params.workTimeRange();
      
      var now = Dat.now();
      var hour = now.getUTCHours();
      var time = now.getTime();

      result = (hour > parseInt(range[0]) && hour < parseInt(range[1]));
      result = result && !((now.getDay() === 6) || (now.getDay() === 0))

      if (!result){
        result = time < Params.accessTimeRenew();
      }
    }

    if (_throw && !result){
      Err.thrw("Usuário "+ user.name + " - " + user.id + " não está habilitado para logar neste momento!");
    }

    return result;
  }



  static getDefault(userId, suppress) {
    var user = this.get(userId);

    if (user && suppress){
      user =  User.suppress(user);
    }

    return user == undefined ? new User(404, 'Desconhecido') : user;
  }



  static getByGroup() {
    var data = {};

    for (var key in global._cachedUsers) {
      if (global._cachedUsers.hasOwnProperty(key)) {
        var user = global._cachedUsers[key];
        if (user.active){
          if (!user.title){
            user.title = 'none';
          }

          var group = Str.normalize(user.title).toLowerCase();

          if (data[group]){
            data[group].push(user);
          }else{
            data[group] = [user];
          }
        }
      }
    }

    return data;
  }

  static checkUserExists(userId) {
    var user = UsersProvider.get(userId);

    if (user === undefined || user.id < 1000) {
      Err.thrw("Usuário " + userId + " não existe.");
    }

    if (!user.active){
      Err.thrw("Usuário não está ativo.");
    }

    return true;
  }


  static checkUserPass(user, pass) {
    if (user.pass !== pass){
      Err.thrw("Senha incorreta (" + pass+ ") para o usuário " + user.name);
    }

    return true;
  }



};
