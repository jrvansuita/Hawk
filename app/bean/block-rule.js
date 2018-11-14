module.exports = class BlockRule extends DataAccess {


  constructor(number, user, reasonTag) {
    super();
    this.number = Str.def(number);
    this.blockDate = new Date();
    this.user = user ? user : {};
    this.reasonTag = Num.def(reasonTag);
    this.blocking = false;
  }

  static getKey() {
    return ['number'];
  }


};
