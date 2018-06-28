module.exports = class Pending extends DataAccess {


  constructor(number, sale) {
    super();
    this.number = Str.def(number);
    this.solving = false;
    this.solved = false;
    this.sale = sale == undefined ? {} : sale;
  }

  static getKey() {
    return ['number'];
  }


};
