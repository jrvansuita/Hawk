module.exports = class User extends DataAccess {

  constructor(id, name) {
    super();
    this.id = Num.def(id);
    this.name = Str.def(name);
  }

  static getKey() {
    return ['id'];
  }

};