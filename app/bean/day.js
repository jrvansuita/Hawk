module.exports = class Day extends DataAccess {

  constructor(userId, date, type, total, count) {
    super();
    this.userId = Num.def(userId);
    this.date = Dat.def(date);
    this.type = Str.def(type);
    this.total = Floa.def(total);
    this.count = Floa.def(count);
  }

  static invoice(sale) {
    return new Day(sale.userId, sale.billingDate, 'invoice', sale.value, 1);
  }

  static picking(userId, date, count) {
    return new Day(userId, date, 'picking', total, count);
  }

  static pointsCalc(count, total) {
    return (count * total) / 10000;
  }



  static getKey() {
    return ['userId', 'date', 'type'];
  }



};