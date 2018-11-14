module.exports = class BlockRule extends DataAccess {


  constructor(number, user, reason) {
    super();
    this.number = Str.def(number);
    this.blockDate = new Date();
    this.user = user ? user : {};
    this.reason = reason ? reason : {};
    this.blocking = false;
  }
 
  static getKey() {
    return ['number'];
  }


};
