const ProductHandler = require('../handler/product-handler.js');
const ProductImageBuilder = require('../builder/product-image-builder.js');
const File = require('../file/file.js');
const Zip = require('../file/zip.js');

module.exports = class{
  constructor(skus){
    this.skus = skus;
    this.folder = './front/product_images/';
  }


  loadProductImage(sku){
    return new Promise((resolve, reject)=>{
      ProductHandler.getImage(sku, (product)=>{
        new ProductImageBuilder()
        .setProduct(product)
        .setOnFinishedListener((canvas) => {
          resolve(canvas)
        })
        .load();
      });
    });
  }

  _canvasToFile(sku, canvas, callback){
    new File()
    .setName(sku + '.png')
    .setFolder(this.folder)
    .fromCanvas(canvas)
    .save(callback);
  }

  _zipFiles(files, callback){
    new Zip()
    .setName('imagens')
    .setPath(this.folder)
    .setFiles(files)
    .setOnError(callback)
    .run(callback);
  }

  loadMultipleProductImages(skus){
    return new Promise((resolve, reject) => {

      var files = [];

      var load = (callback) => {
        var sku = skus[skus.length-1];
        skus.pop();

        if (sku){
          this.loadProductImage(sku).then((canvas) => {
            this._canvasToFile(sku, canvas, (file) => {
              files.push(file);
              load();
            });
          });
        }else{
          this._zipFiles(files, resolve);
        }
      }

      load();
    });
  }

  load(){
    if (Array.isArray(this.skus)){
      return this.loadMultipleProductImages(this.skus)
    }else{
      return this.loadProductImage(this.skus)
    }
  }

};
