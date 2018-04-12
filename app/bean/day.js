module.exports = class Day extends DataAccess {

  constructor(userId, date, type, total, count) {
    super();
    this.userId = parseInt(userId);
    this.date = date;
    this.type = type;
    this.total = total;
    this.count = count;
  }

  static invoice(sale) {
    return new Day(sale.userId, sale.billingDate, 'invoice', sale.value, 1);
  }

  static picking(userId, date, count) {
    return new Day(userId, date, 'picking', total, count);
  }


  static getKey() {
    return ['userId', 'date', 'type'];
  }



};