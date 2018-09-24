module.exports = class User extends DataAccess {

  constructor(id, name) {
    super();
    this.id = Num.def(id, 0);
    this.name = Str.def(name, 'Desconhecido');
    this.full = false;
    this.access = '';
    this.avatar = '';
  }

  static getKey() {
    return ['id'];
  }

  static updateAccess(userId, userAccess){
    User.upsert({id: userId},{
      access : userAccess
    });
  }

};
