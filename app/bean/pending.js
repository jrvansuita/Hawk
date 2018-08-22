module.exports = class Pending extends DataAccess {


  constructor(number, sale, local) {
    super();
    this.number = Str.def(number);
    this.solving = false;
    this.solved = false;
    this.sale = sale == undefined ? {} : sale;
    this.updateDate = Dat.now();
    this.sendEmail = false;
    this.local = Str.def(local);
  }

  static getKey() {
    return ['number'];
  }


};
