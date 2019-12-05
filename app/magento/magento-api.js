const MagentoAPI = require('magento');
const History = require('../bean/history.js');

module.exports = class MagentoApi extends MagentoAPI{

  constructor(){
    super({
      host: process.env.MAGENTO_HOST,
      port: 443,
      path: process.env.MAGENTO_PATH,
      login: process.env.MAGENTO_LOGIN,
      pass: process.env.MAGENTO_PASS,
      secure: true
    })
  }


  instance(callback){
    if (!this.sessionId){
      this.login((err, sessId) => {
        if (err) {
          throw err;
        }

        callback(this);
      });
    }else{
      callback(this);
    }
  }


};
