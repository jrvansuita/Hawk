


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





var ruleAttrsEnum = {
  TOTAL_SALE: {
    label: 'Valor do Pedido',
    key: 'totalVenda'
  },

  TOTAL_PRODUCTS: {
    label: 'Valor dos Produtos',
    key: 'totalProdutos'
  },

  PAYMENT_FORM: {
    label: 'Forma de Pagamento',
    key: 'observacaoInterna'
  },

  INNER_OBS: {
    label: 'Observação Interna',
    key: 'observacaoInterna'
  },

  TRANSPORT: {
    label: 'Transportadora',
    key: 'transportador'
  }
};

var ruleConditionsEnum = {
  EQUAL:{
    label: 'Igual',
    match: (a, b) => {
      return a && b && (a.toString() == b.toString());
    }
  },
  GREATER:{
    label: 'Maior',
    match: (a, b) => {
      return Floa.def(a) > Floa.def(b);
    }
  },
  SMALLER:{
    label: 'Menor',
    match: (a, b) => {
      return Floa.def(a) < Floa.def(b);
    }
  },
  CONTAINS:{
    label: 'Contém',
    match: (a, b) => {
      return a && b && (a.toString().includes(b.toString()));
    }
  }
};
