module.exports = class Sale extends DataAccess {

  constructor(number, billingDate, userId, value) {
    super();
    this.number = Str.def(number);
    this.billingDate = Dat.def(billingDate);
    this.userId = Num.def(userId);
    this.value = Floa.def(value);
  }

  static getKey() {
    return ['number'];
  }
};