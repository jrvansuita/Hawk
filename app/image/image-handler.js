const Jimp = require('jimp');
const Buffer = require('buffer').Buffer;

module.exports = class ImageHandler {


  setOnError(onError){
    this.onError = onError;
    return this;
  }

  setOnSuccess(onSuccess){
    this.onSuccess = onSuccess;
    return this;
  }

  setWidth(width){
    this.width = width;
    return this;
  }

  setHeigth(heigth){
    this.heigth = heigth;
    return this;
  }

  setScale(scale){
    this.scale = scale;
    return this;
  }

  setQuality(quality){
    this.quality = quality;
    return this;
  }

  setBase64Image(base64Image){
    this.base64Image = base64Image;
    return this;
  }

  _getBase64(){
    if(this.base64Image.indexOf('base64') != -1) {
      return this.base64Image.replace(/^data:image\/png;base64,/, "");
    }

    return this.base64Image;
  }

  _getBuffer(){
    return Buffer.from(this._getBase64(), 'base64');
  }

  async _transforms(image, onFinish){

    if (this.scale){
      await image.scale(this.scale, Jimp.RESIZE_BEZIER);
    }

    if (this.width || this.heigth){
      await image.resize(this.width || Jimp.AUTO, this.heigth || Jimp.AUTO);
    }

    if (this.quality){
      await image.quality(this.quality);
    }

    if (onFinish){
      image.getBase64(Jimp.AUTO, (err, src) => {
        if (err){
          if (this.onError){
            this.onError(err);
          }else{
            console.log(err);
          }
        }else{    
          this.base64Image = src;
          onFinish(this._getBase64());
        }
      });
    }
  }

  async process(){
    Jimp.read(this._getBuffer()).then((image) => {
      this._transforms(image, this.onSuccess);
    }).catch(this.onError);
  }



};
