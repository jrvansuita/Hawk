


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
    return attributes;
  }

  static conditions(){
    return conditions;
  }
};



var attributes = {

  SITUATION: {
    label: 'Situação do Pedido',
    key: 'situacao',
    options: {
      '-1': 'Aguardando Pagamento',
      '0': 'Em aberto',
      '3': 'Pronto para picking',
      '4': 'Pagamento em análise'
    }
  },

  TOTAL_SALE: {
    label: 'Valor do Pedido',
    key: 'totalVenda',
    options: 'float'
  },

  TOTAL_PRODUCTS: {
    label: 'Valor dos Produtos',
    key: 'totalProdutos',
    options: 'float'
  },

  TOTAL_FREIGTH: {
    label: 'Valor do Frete',
    key: 'frete',
    options: 'float'
  },

  DELIVERY_TIME: {
    label: 'Prazo do Entrega',
    key: 'deliveryTime',
    options: 'integer'
  },

  COUPON: {
    label: 'Cupom de Desconto',
    key: 'observacaoInterna'
  },

  TOTAL_DISCOUNT: {
    label: 'Valor do Desconto',
    key: 'desconto',
    options: 'float'
  },

  WEIGHT: {
    label: 'Peso Bruto',
    key: 'pesoBruto',
    options: 'float'
  },

  ITEMS_QUANTITY: {
    label: 'Quantidade de Itens',
    key: 'itemsQuantity',
    options: 'integer'
  },

  PAYMENT_FORM: {
    label: 'Forma de Pagamento',
    key: 'paymentType',
    options: {'boleto' : 'Boleto', 'creditcard': 'Cartão de Crédito'}
  },

  INNER_OBS: {
    label: 'Observação Interna',
    key: 'observacaoInterna'
  },

  TRANSPORT: {
    label: 'Transportadora',
    key: 'transport',
    options: ['Jadlog', 'DBA', 'Transfolha', 'Azul', 'Rede Sul', 'Coreios']
  },

  FIRST_SALE: {
    label: 'Primeira Compra',
    key: 'primeiraCompra',
    options: {'1' : 'Sim', '0': 'Não'}
  }
};

var conditions = {
  EQUAL:{
    label: 'Igual',
    match: (a, b) => {
      return a && b && (a == b);
    },
    accepts:['integer', 'float']
  },
  GREATER:{
    label: 'Maior',
    match: (a, b) => {
      return Floa.def(a) > Floa.def(b);
    },
    accepts:['integer', 'float']
  },
  SMALLER:{
    label: 'Menor',
    match: (a, b) => {
      return Floa.def(a) < Floa.def(b);
    },
    accepts:['integer', 'float']
  },

  IS:{
    label: 'É',
    match: (a, b) => {
      return a && b && (a.toLowerCase().toString() == b.toLowerCase().toString());
    }
  },

  NOT_IS:{
    label: 'Não É',
    match: function(a, b) {
      return !conditions.IS.match(a, b);
    }
  },

  CONTAINS:{
    label: 'Contém',
    match: (a, b) => {
      return a && b && (a.toLowerCase().toString().includes(b.toLowerCase().toString()));
    }
  },

  NOT_CONTAINS:{
    label: 'Não Contém',
    match: function (a, b) {
      return !conditions.CONTAINS.match(a, b);
    }
  }
};
