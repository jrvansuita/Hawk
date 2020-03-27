const SkuPic = require('../bean/sku-pic.js');
const ImageSaver = require('../image/image-saver.js');
const ImageHandler = require('../image/image-handler.js');

module.exports = class ClientShareLoader{

  constructor(sku){
    this.sku = sku;
  }

  setBase64Image(data){
    this.base64Image = data;
    return this;
  }

  _transform(callback){
    new ImageHandler()
    .setQuality(90)
    .setWidth(300)
    .setBase64Image(this.base64Image)
    .setOnSuccess((newBase64) => {
      this.base64Image = newBase64;
      callback();
    }).setOnError((err) => {
      console.log(err);
      this.base64Image = undefined;
      callback();
    })
    .process();
  }

  _storeImage(callback){
    if (this.base64Image){
      new ImageSaver()
      .setBase64Image(this.base64Image)
      .setOnSuccess((data) => {
        callback(data.link);
      })
      .upload();
    }else{
      callback(null);
    }
  }

  _storeSkuPic(link, callback){
    if (link){
      var row = SkuPic.storeFront(this.sku, link);

      SkuPic.create(row, (err, doc)=>{
        if (callback){
          callback(doc);
        }
      });
    }else{
      if (callback){
        callback(null);
      }
    }
  }

  load(callback){
    this._transform(() => {
      this._storeImage((link) => {
        this._storeSkuPic(link, callback);
      });
    });
  }

}
