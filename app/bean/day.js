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

  static picking(userId, date) {
    return new Day(userId, date, 'picking');
  }

  static invoicePoints(count, total) {
    return (count * total) / 10000;
  }

  static pickingPoints(itens, itensByTime) {
    return (itens) / itensByTime;
  }


  static getKey() {
    return ['userId', 'date', 'type'];
  }



};
