
module.exports = class GiftRule extends DataAccess {


  constructor(id, name, active, expiresDate) {
    super();
    this.id = Num.def(id, 0) || Util.id();
    this.name = Str.def(name);
    this.active = active ? true: false;
    this.expiresDate = Dat.def(expiresDate) ;
    this.skus = [];
    this.rules = [];
  }

  addRule(name, attr, sign, value){
    var rule = {name: name, attr: attr, sign: sign, value: value};
    this.rules.push(rule);
  }

  addSku(sku){
    this.skus.push(sku);
  }

  static getKey() {
    return ['id'];
  }



};
