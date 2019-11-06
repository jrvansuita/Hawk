const ProductHandler = require('../handler/product-handler.js');
const ProductUrlProvider = require('../provider/product-url-provider.js');
const ProductMockupBuilder = require('../mockup/product-mockup-builder.js');
const fs = require('fs')
const archiver = require('archiver');
const path = require("path");

module.exports = class{
  constructor(mockId, skus){
    this.mockId = mockId;
    this.skus = skus;
    this.folder = './front/_mockups/';
  }


  loadProduct(sku){
    return new Promise((resolve, reject)=>{
      ProductHandler.getImage(sku, (product)=>{
        if (product){
          new ProductUrlProvider().from(product.url).then((onlineValues)=>{
            product.online = onlineValues;
            resolve(product);
          }).catch(e=>{
            resolve(product);
          });
        }else{
          resolve(product);
        }
      });
    });
  }

  loadProductImage(sku){
    return new Promise((resolve, reject)=>{
      this.loadProduct(sku)
      .then((product)=>{
        new ProductMockupBuilder(this.mockId)
        .setProduct(product)
        .setOnFinishedListener((canva)=>{
          resolve(canva);
        })
        .load();
      });
    });
  }

  _canvasToFile(sku, canvas, callback){
    fs.mkdir(this.folder, { recursive: true }, (err) => {
      var out = fs.createWriteStream(this.folder + sku + '.png');
      var stream = canvas.pngStream();

      stream.on('data', function(chunk){
        out.write(chunk);
      });

      stream.on('end', () => callback(out));
    });
  }

  _zipFiles(files, callback){
    var zipPath = this.folder + 'mockups.zip';
    var output = fs.createWriteStream(zipPath);
    var archive = archiver('zip', {
      gzip: true,
      zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('error', function(err) {
      throw err;
    });

    // pipe archive data to the output file
    archive.pipe(output);

    // append files
    files.forEach((file) => {
      archive.file(file.path, {name:  path.basename(file.path)});
    })

    output.on('close', () => callback(zipPath));

    archive.finalize();
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
