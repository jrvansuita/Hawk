module.exports = class SkuPic extends DataAccess {

  constructor(sku, url, img, type) {
    super();
    this.sku = Str.def(sku);
    this.url = Str.def(url);
    this.type = Str.def(type);
    this.img = Str.def(img);
    this.date = Dat.now();
    this.approved = true;
  }

  static getKey() {
    return ['_id'];
  }

  static insta(sku, url, img) {
    return new SkuPic(sku, url, img, 'insta');
  }

  static fb(sku, url, img) {
    return new SkuPic(sku, url, img, 'fb');
  }


  static approved(_id, approved, callback) {
    SkuPic.upsert({_id: _id}, {approved : approved},(err, doc)=>{
      callback(doc)
    });
  }


  static getPage(page, sku, callback) {
    var limit = 16;

    SkuPic.paginate(
      { 'sku': {
        "$regex": sku,
        "$options": "i"
      },
      approved: true
    }, page, '-date', limit, (err, result)=>{
      var dif = limit - result.length;

      if (dif <= 0){
        callback(result);
      }else{
        SkuPic.getLasts({approved: true}, dif, (err, docs) => {
          callback(result.concat(docs.sort(function() {
            return .5 - Math.random();
          })
        ));
      });
    }
  });
}


};
