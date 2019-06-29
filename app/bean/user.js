module.exports = class User extends DataAccess {

  constructor(id, name, lastName, title, avatar, access, isFull, isActive, token) {
    super();
    this.id = Num.def(id, 0);
    this.name = Str.def(name, 'Desconhecido');
    this.lastName = Str.def(lastName);
    this.title = Str.def(title);
    this.full = isFull ? true: false;
    this.access = Str.def(access);
    this.avatar = Str.def(avatar);
    this.active = isActive ? true: false;
    this.token = Str.def(token);
    this.setts = {};
  }

  static getKey() {
    return ['id'];
  }



  static suppress(user){
    if (user){
      return Util.removeAttrs(user, ['name', 'id', 'avatar','full', 'access']);
    }

    return {};
  }


};
