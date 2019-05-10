module.exports = class BlockRule extends DataAccess {


  constructor(number, user, reasonTag) {
    super();
    this.number = Str.def(number);
    this.blockDate = new Date();
    this.user = BlockRule.clearUser(user);
    this.reasonTag = Num.def(reasonTag);
    this.blockings = Num.def(0);
  }

  static getKey() {
    return ['number'];
  }

  static clearUser(user){
    if (user){
      return Util.removeAttrs(user, ['name', 'id', 'avatar']);
    }

    return {};
  }


};
