const User = require('../bean/user.js');


module.exports = class BlockRule extends DataAccess {


  constructor(number, user, reasonTag) {
    super();
    this.number = Str.def(number);
    this.blockDate = new Date();
    this.user = User.suppress(user);
    this.reasonTag = Num.def(reasonTag);
    this.blockings = Num.def(0);
  }

  static getKey() {
    return ['number'];
  }


};
