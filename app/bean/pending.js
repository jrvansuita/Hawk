module.exports = class Pending extends DataAccess {

/*
Pending status
0 - Open
1 - Solving
2 - Solved
3 - Assumed
*/

  constructor(number, sale, local) {
    super();
    this.number = Str.def(number);
    this.status = 0;
    this.sale = sale == undefined ? {} : sale;
    this.updateDate = Dat.now();
    this.sendEmail = false;
    this.local = Str.def(local ? local.toUpperCase() : "");
  }

  static getKey() {
    return ['number'];
  }

  


};
