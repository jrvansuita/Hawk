module.exports = class Sale extends DataAccess {

  constructor(number, billingDate, userId, value) {
    super();
    this.number = Str.def(number);
    this.billingDate = Dat.def(billingDate);
    this.userId = Num.def(userId);
    this.value = Floa.def(value);
    this.synced = false;
  }

  static getKey() {
    return ['number'];
  }

  static findNotSynced(callback) {
    this.find({
        synced: false,
      },
      (err, docs) => {
        if (callback)
          callback(err, docs);
      });
  }

  static invoiceCode(sale) {
    return sale.userId + '-invoie-' + sale.billingDate.getTime();
  }

  // static sync(sale) {
  //   sale.synced = true;
  //   this.upsert(this.getKeyQuery(sale.number), sale);
  // }

  static syncAll() {
    this.updateAll({
      synced: false,
    }, {
      synced: true,
    });
  }
};
