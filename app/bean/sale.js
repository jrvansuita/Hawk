module.exports = class Sale extends DataAccess {

  constructor(number, date, deliveryTime, freightValue, transport, total, productCost, quantityItems, uf, city, paymentType, coupom, discount, repurchase, weight) {
    super();
    this.number = Str.def(number);
    this.date = Dat.def(date);

    this.deliveryTime = Num.def(deliveryTime);
    this.freightValue = Floa.def(freightValue);
    this.transport = Str.def(transport);

    this.total = Floa.def(total);
    this.productCost = Floa.def(productCost);
    this.quantityItems = Num.def(quantityItems);
    this.uf = Str.def(uf);
    this.city = Str.def(city);
    this.paymentType = Str.def(paymentType);
    this.coupom = Str.def(coupom);
    this.discount = Floa.def(discount);
    this.repurchase = repurchase ? true : false;
    this.weight = Floa.def(weight);
  }

  static getKey() {
    return ['number'];
  }

  static likeQuery(value){
    return Sale.or(['uf', 'paymentType', 'transport'], value);
  }

  static dateRange(min, max){
    return Sale.range('date', min, max, true);
  }

  static attrsQuery(field, values){
    return Sale.or(field, values);
  }


  static from(s){
    var cost = Floa.abs(s.items.reduce((count, i)=>{ return count + parseFloat(i.cost)}, 0),2);
    var uf = s._OutroEndereco ? s._OutroEndereco.uf : '';
    var city = s._OutroEndereco ? s._OutroEndereco.cidade : '';


    return new Sale(
      s.numeroPedido,
      new Date(),
      s.deliveryTime,
      s.frete,
      s.transport,
      s.totalVenda,
      cost,
      s.itemsQuantity,
      uf,
      city,
      s.paymentType,
      s.coupom,
      s.desconto,
      s.primeiraCompra != '1',
      s.pesoTransportadora
    );
  }

};
