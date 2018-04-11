module.exports = class Day {

  constructor(userId, date, type, total, count) {
    this.userId = parseInt(userId);
    this.date = date;
    this.type = type;
    this.total = total;
    this.count = count;
  }

  static invoice(userId, date, total, count) {
    return new Day(userId, date, 'invoice', total, count);
  }

  static picking(userId, date, count) {
    return new Day(userId, date, 'picking', total, count);
  }



};