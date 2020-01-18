

var Params = {

  isRunningOnServer(){
    return typeof global !== 'undefined';
  },

  bundle(){
    return this.isRunningOnServer() ? global._mainParams : _params;
  },

  get(name){
    return this.bundle()[name];
  },

  storeUrl(){
    return this.get('store-url');
  },

  storeFeedUrl(){
    return this.get('store-feed-url');
  },

  eccosysUrl(){
    return this.get('eccosys-url');
  },

  eccosysApi(){
    return this.get('eccosys-api');
  },

  eccosysSecret(){
    return this.get('eccosys-secret');
  },

  eccosysApiReportEmails(){
    return this.get('eccosys-api-down-email');
  },


  replayEmail(){
    return this.get('email-reply');
  },

  email(){
    return this.get('email');
  },

  emailPass(){
    return this.get('email-pass');
  },


  imgurId(){
    return this.get('imgur-id');
  },

  imgurEmail(){
    return this.get('imgur-email');
  },

  imgurPass(){
    return this.get('imgur-pass');
  },


  mundipaggUrl(){
    return this.get('mundipagg-url');
  },

  mundipaggSecret(){
    return this.get('mundipagg-secret');
  },

  magentoUrl(){
    return this.get('magento-url');
  },

  magentoXmlPath(){
    return this.get('xmlrpc-path');
  },

  magentoLogin(){
    return this.get('magento-login');
  },

  magentoPass(){
    return this.get('magento-pass');
  },

  autoBlockPending(){
    return this.get('auto-block-pending');
  },

  timeBlockPending(){
    return this.get('time-block-pending');
  },

  updateProductWeightMagento(){
    return this.get('update-product-weight-magento');
  },

  updateProductStockMagento(){
    return this.get('update-product-stock-magento');
  },

  devMaxSalesOnPicking(){
    return this.get('dev-max-sales-picking');
  }
}




if (typeof module != 'undefined')
module.exports = Params;
