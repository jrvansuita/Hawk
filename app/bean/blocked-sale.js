module.exports = class BlockedSale extends DataAccess {


  constructor(number, user, blockDate) {
    super();
    this.number = Str.def(number);
    this.blockDate = Dat.def(blockDate);
    this.user = user? user : {};
  }

  static getKey() {
    return ['number'];
  }


};
