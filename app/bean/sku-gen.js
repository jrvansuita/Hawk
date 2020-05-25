module.exports = class SkuGen extends DataAccess {

  constructor(prefix, count) {
    super();
    this.prefix = Str.def(prefix);
    this.count = count || 1;
  }

  static getKey() {
    return ['prefix'];
  }

  static async go(prefix){
    return new Promise((resolver) => {
      prefix = prefix.toUpperCase();
      SkuGen.findOne({prefix: prefix}, (err, doc) => {
        var count = doc && doc.count ? doc.count : 1;
        var padding = "0000" + count;
        resolver(prefix + padding.substr(-4));

        new SkuGen(prefix, ++count).upsert();
      });
    });
  }

};
