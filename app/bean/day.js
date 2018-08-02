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
    return (count * (total/6)) / 10000;
  }

  //itens / itensByTime
  static pickingPoints(count, total) {
    return ((total) / (count/total)) * 4;
  }


  static getKey() {
    return ['userId', 'date', 'type'];
  }



};
