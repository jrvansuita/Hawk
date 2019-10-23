

module.exports = class Job extends DataAccess {

  constructor(id, tag, description, type, active, rule) {
    super();
    this.id = Num.def(id, 0) || Util.id();
    this.tag = Str.def(tag);
    this.description = Str.def(description);
    this.type = Str.def(type);
    this.active = active ? true: false;
    this.lastExcecution = 0;
    this.rule = rule || {};
  }


  static getKey() {
    return ['id'];
  }

};
