const ProductHandler = require('../handler/product-handler.js');
const ProductUrlProvider = require('../provider/product-url-provider.js');
const ProductMockupBuilder = require('../mockup/product-mockup-builder.js');


module.exports = class{
  constructor(sku){
    this.sku = sku;
  }

  loadProduct(){
    return new Promise((resolve, reject)=>{
      ProductHandler.getImage(this.sku, (product)=>{
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

  load(){
    return new Promise((resolve, reject)=>{
      this.loadProduct()
      .then((product)=>{
        new ProductMockupBuilder()
        .setProduct(product)
        .setOnFinishedListener((canva)=>{
          resolve(canva);
        })
        .load();
      });
    });
  }

};
