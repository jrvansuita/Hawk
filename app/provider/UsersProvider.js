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

    return new User();
  }



  static getDefault(userId) {
    var user = this.get(userId);
    return user == undefined ? new User(404, 'Desconhecido') : user;
  }


  static checkUserExists(userId) {
    var user = UsersProvider.get(userId);

    if (user == undefined || user.id == 404 || user.id === 0) {
      throw "Usuário não existe.";
    }

    return true;
  }

  static updateUserAccess(userId, userAccess, callback){
    User.findOne({access: userAccess}, (err, user)=>{
      if (user){
        callback(true, 'Código de acesso já está sendo usando pelo usuário ' + user.name);
      }else{
        user = UsersProvider.get(userId);
        if (user != undefined && user.access){
          callback(true, 'O usuário ' + user.name + ' já possui um código de acesso.');
        }else{
          User.updateAccess(userId, userAccess);
          global.localUsers[userId].access = userAccess;
          callback(false);
        }
      }
    });
  }


  static login(userId, userAccess, callback){
    if (userId){
      UsersProvider.updateUserAccess(userId, userAccess, (err, msg)=>{
        if (err){
          callback(undefined, msg);
        }else{
          callback(UsersProvider.get(userId));
        }
      });
    }else{
      callback(UsersProvider.get(userAccess));
    }
  }


};
