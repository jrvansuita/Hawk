module.exports = class User extends DataAccess {

  constructor(id, name, title, avatar, access, isFull, isActive, token, isLeader) {
    super();
    this.id = Num.def(id, 0) || User.nextId();
    this.name = Str.def(name, 'Desconhecido');
    this.title = Str.def(title);
    this.full = isFull ? true: false;
    this.access = Str.def(access);
    this.avatar = Str.def(avatar);
    this.active = isActive || !id ? true: false;
    this.leader = isLeader ? true: false;
    this.token = Str.def(token);
    this.setts = {};
    this.menus = [];
  }

  static getKey() {
    return ['id'];
  }


  static nextId(){
    return parseInt(new Date().getTime().toString().slice(-8));
  }


  static suppress(user){
    if (user){
      return Util.removeAttrs(user, ['name', 'id', 'avatar','full', 'access']);
    }

    return {};
  }


  static updateAvatar(userId, link, callback) {
     User.upsert({id: userId}, {avatar : link},(err, user)=>{
       callback(user)
     });
  }


};
