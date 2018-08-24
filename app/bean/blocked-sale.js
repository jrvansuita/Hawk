module.exports = class BlockedSale extends DataAccess {


  constructor(number, userId, blockDate) {
    super();
    this.number = Str.def(number);
    this.blockDate = Dat.def(blockDate);
    this.userId = Num.def(userId);
  }

  static getKey() {
    return ['number'];
  }


};
