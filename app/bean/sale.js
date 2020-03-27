module.exports = class Sale extends DataAccess {

  constructor(number, date, deliveryTime, freightValue, transport, total, productCost, quantityItems, uf, paymentType) {
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
    this.paymentType = Str.def(paymentType);
  }

  static getKey() {
    return ['number'];
  }

  static likeQuery(value){
    var result = {};
    var fields = ['uf', 'paymentType', 'transport'];

    var like = fields.map((each) => {
      var cond = {};
      cond[each] = {
        "$regex": value,
        "$options": "i"
      };

      return cond;
    });

    return {'$or': like};
  }


  static from(s){
    var cost = s.items.reduce((count, i)=>{ return count + parseFloat(i.cost)}, 0)

    return new Sale(
      s.numeroPedido,
      new Date(s.data),
      s.deliveryTime,
      s.frete,
      s.transport,
      s.totalVenda,
      cost,
      s.itemsQuantity,
      s.client.uf,
      s.paymentType
    );
  }

};
