module.exports = class Setts extends DataAccess {

  /*
  group = 0 - General, 1 - Picking, 2 - Packing, 3 - Stock, 4 - Pending, 5 - Performance
  type = 0 - boolean, 1 number, 2 - string
  */

  constructor(id, name, group, type) {
    super();
    this.id = Num.def(id);
    this.name = Str.def(name);
    this.group = Num.def(group);
    this.type = Num.def(type);
  }

  static getKey() {
    return ['id'];
  }

};
