const pageLimit = 16;

module.exports = class SkuPic extends DataAccess {

  constructor(sku, url, img, type, approved) {
    super();
    this.sku = Str.def(sku);
    this.url = Str.def(url);
    this.type = Str.def(type);
    this.img = Str.def(img);
    this.date = Dat.now();
    this.approved = approved ? true : false;
  }

  static getKey() {
    return ['_id'];
  }

  static storeFront(sku, img) {
    return new SkuPic(sku,  '', img, 'store-front', false);
  }

  static insta(sku, url, img) {
    return new SkuPic(sku, url, img, 'insta', true);
  }

  static fb(sku, url, img) {
    return new SkuPic(sku, url, img, 'fb', true);
  }


  static approved(_id, approved, callback) {
    SkuPic.upsert({_id: _id}, {approved : approved},(err, doc)=>{
      console.log(err);
      callback(doc)
    });
  }

  static getToBeApprovedPage(page, callback) {
    SkuPic.paginate({approved: false}, page, 'date', pageLimit, callback);
  }

  static getPageQuery(sku, not){
    var result = {approved: true};
    var reg =  new RegExp(sku, 'i');

    if (not){
      result['sku'] = {$not: reg}
    }else{
      result['sku'] = reg;
    }

    return result;
  }

  static getSkuPage(page, sku, limit, callback){
    SkuPic.paginate(SkuPic.getPageQuery(sku), page, '-date', limit ? limit : pageLimit, (err, result)=>{

      if (callback){
        callback(result);
      }
    });
  }


  static getSkuPageFlex(page, sku, callback) {
    SkuPic.getSkuPage(page, sku, (result) => {

      var dif = pageLimit - result.length;

      if (dif <= 0){
        callback(result);
      }else{
        SkuPic.getLasts(SkuPic.getPageQuery(sku, true), dif, (err, docs) => {
          docs = docs ? docs : [];
          var result = result.concat(docs.sort(function() {
            return .5 - Math.random();
          }));

          callback(result);
        });
      }
    });
  }


};
