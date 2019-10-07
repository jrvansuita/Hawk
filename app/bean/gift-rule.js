
module.exports = class GiftRule extends DataAccess {


  constructor(id, name, sku) {
    super();
    this.id = Num.def(id, 0) || Util.id();
    this.name = Str.def(name);
    this.sku = Str.def(sku);
    this.rules = [];
  }

  add(name, attr, sign, value){
    var rule = {name: name, attr: attr, sign: sign, value: value};
    this.rules.push(rule);
  }

  static getKey() {
    return ['id'];
  }



};
