module.exports = class SkuPic extends DataAccess {

  constructor(sku, url) {
    super();
    this.sku = Str.def(sku);
    this.url = Str.def(url);
    this.date = Dat.now();
    this.approved = false;
  }

  static getKey() {
    return ['_id'];
  }


  static approved(_id, approved, callback) {
     SkuPic.upsert({_id: _id}, {approved : approved},(err, doc)=>{
       callback(doc)
     });
  }


  static getPage(page, sku, callback) {
     SkuPic.paginate({ 'sku': {
       "$regex": sku,
       "$options": "i"
     }},  page, '-date', (err, doc)=>{
       callback(doc)
     });
  }


};
