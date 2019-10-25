
var ruleAttrsEnum = {
  TOTAL_SALE: 'Valor do Pedido',
  TOTAL_PRODUCTS: 'Valor dos Produtos',
  PAYMENT_FORM: 'Forma de pagamento',
  INNER_OBS: 'Observação Interna',
  TRANSPORT: 'Transportadora'
};

var ruleConditionsEnum = {
  EQUAL:{
    label: 'Igual',
    func: 'teste'
  },
  GREATER:{
    label: 'Maior',
    func: 'teste'
  },
  SMALLER:{
    label: 'Menor',
    func: 'teste'
  },
  CONTAINS:{
    label: 'Contém',
    func: 'teste'
  }
};


module.exports = class GiftRule extends DataAccess {


  constructor(id, name, active, checkStock, expiresDate) {
    super();
    this.id = Num.def(id, 0) || Util.id();
    this.name = Str.def(name);
    this.active = active ? true: false;
    this.expiresDate = Dat.def(expiresDate);
    this.checkStock = checkStock ? true : false;
    this.skus = [];
    this.rules = [];
  }

  addRules(rules){
    this.rules = rules;
  }

  addSkus(skus){
    this.skus = skus;
  }

  static findActives(callback){
    GiftRule.find({
      active : true,
      expiresDate: {$gte : Dat.today().begin()}
    }, callback);
  }



  static getKey() {
    return ['id'];
  }


  static attrs(){
    return ruleAttrsEnum;
  }

  static conditions(){
    return ruleConditionsEnum;
  }
};
