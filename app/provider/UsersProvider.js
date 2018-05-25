const User = require('../bean/user.js');

module.exports = class UsersProvider {

  static loadAllUsers() {
    global.localUsers = {};
    User.findAll(function(err, users) {
      users.forEach(function(user) {
        global.localUsers[user.id] = user;
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

  static get(userId) {
    return global.localUsers[userId];
  }

  static getDefault(userId) {
    var user = this.get(userId);
    return user == undefined ? new User(404, 'Desconhecido') : user;
  }


  static checkUserExists(userId) {
    if (global.localUsers[userId] == undefined) {
      throw "Usuário não existe.";
    }

    return true;
  }

};