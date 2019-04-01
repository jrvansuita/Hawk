const User = require('../bean/user.js');
const Err = require('../error/error.js');

module.exports = class UsersProvider {

  static loadAllUsers() {
    global.localUsers = {};
    User.findAll(function(err, users) {
      users.forEach(function(user, doc) {
        global.localUsers[user.id] = user['_doc'];
      });
    });
  }

  static getAllUsers() {
    if (!global.localUsers) {
      this.loadAllUsers();
    } else {
      return global.localUsers;
    }
  }

  static store(user) {
    if (global.localUsers[user.id] === undefined) {
      user.upsert();

      global.localUsers[user.id] = user;
    }
  }

  static addUser(user){
    global.localUsers[user.id] = user;
  }

  static remove(userId){
    delete global.localUsers[userId];
  }

  static get(code) {
    if (code !== undefined){
      if(global.localUsers[code]){
        return global.localUsers[code];
      }else{
        for (var key in global.localUsers) {
          if (global.localUsers.hasOwnProperty(key)) {
            if (global.localUsers[key].access === code){
              return global.localUsers[key];
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


  static checkUserExists(userId) {
    var user = UsersProvider.get(userId);

    if (user === undefined || user.id < 1000) {
      Err.thrw("Usuário não existe.");
    }

    if (!user.active){
      Err.thrw("Usuário não está ativo.");
    }

    return true;
  }



};
