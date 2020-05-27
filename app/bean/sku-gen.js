module.exports = class SkuGen extends DataAccess {

  constructor(key, count) {
    super();
    this.key = Str.def(key);
    this.count = count || 1;
  }

  static getKey() {
    return ['key'];
  }

  static compose(prefix, suffix, count){
    return prefix.toUpperCase() + parseInt(count) + suffix.toLowerCase();
  }

  static get(p, s, callback){
    var key = (p+s).toUpperCase();
    SkuGen.findOne({key: key}, (err, doc) => {
      if (callback) callback(key, doc && doc.count ? doc.count : 1);
    });
  }

  static async go(p, s){
    return new Promise((resolver) => {
      SkuGen.get(p, s, (key, count) => {
        resolver(SkuGen.compose(p, s, count));
        new SkuGen(key, ++count).upsert();
      });
    });
  }
}
