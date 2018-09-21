module.exports = class BlockedSale extends DataAccess {


  constructor(number, user, reason) {
    super();
    this.number = Str.def(number);
    this.blockDate = new Date();
    this.user = user ? user : {};
    this.reason = reason ? reason : {};
    this.blocking = true;
  }

  static getKey() {
    return ['number'];
  }


};
