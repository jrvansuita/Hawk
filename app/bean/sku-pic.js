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
    SkuPic.paginate(
      { 'sku': {
        "$regex": sku,
        "$options": "i"
      }
    },
    page,
    '-date',
    9,
    (err, doc)=>{
      callback(doc)
    });
  }


};
