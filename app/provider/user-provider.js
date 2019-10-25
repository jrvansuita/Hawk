const User = require('../bean/user.js');
const Err = require('../error/error.js');

module.exports = class UsersProvider {

  static loadAllUsers() {
    global._cachedUsers = {};
    User.findAll(function(err, users) {
      users.forEach(function(user, doc) {
        global._cachedUsers[user.id] = user['_doc'];
      });
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



  static getDefault(userId) {
    var user = this.get(userId);
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



};
