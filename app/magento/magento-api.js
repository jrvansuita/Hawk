const MagentoAPI = require('magento');
const History = require('../bean/history.js');

module.exports = class MagentoApi extends MagentoAPI{

  constructor(){
    super({
      host: Params.magentoUrl(),
      port: 443,
      path: Params.magentoXmlPath(),
      login: Params.magentoLogin(),
      pass: Params.magentoPass(),
      secure: true
    });
  }

  instance(callback){
    if (!this.sessionId){
      return new Promise((resolve, reject) => {
        this.login((err, sessId) => {
          if (err) {
            reject(err);
          }
          resolve(this);
        });
      });
    }else{
      return this;
    }
  }


  

  /*async product(sku){
    let handler = await this._instance();

    return new Promise((resolve, reject) => {
      handler.catalogProduct.info({
        id: sku,
      }, (err, product) => {
        resolve(product);
      });
    });
  }


  getProduct(sku, callback){
    this.catalogProduct.info({
      id: sku,
    }, (err, product) => {
      if (callback)
      callback(product);
    });
  }

  updateProductWeight(sku, weight, callback){
    this.catalogProduct.update({
      id:         sku,
      data:       {weight: weight}
    }, (err, doc) => {
      if (callback)
      callback(doc);
    });
  }*/




};
