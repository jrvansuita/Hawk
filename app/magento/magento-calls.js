const MagentoApi = require('../magento/magento-api.js');

module.exports = class MagentoCalls{

  constructor(){
    this.api = new MagentoApi();
  }

  async onInstance(callback){
    let apiHandler = await this.api.instance();
    return new Promise((resolve, reject) => {
      callback(apiHandler, resolve, reject);
    });
  }

  onResult(resolve, reject){
    return (err, result)=>{
      if (err){
        reject(err);
      }else{
        resolve(result);
      }
    };
  }

  async saleByClient(clientId){
    return this.onInstance((api, resolve, reject) => {
      api.salesOrder.list({
        filters: { customer_id: clientId }
      }, this.onResult(resolve, reject));
    });
  }


  async sale(number){
    return this.onInstance((api, resolve, reject) => {
      api.salesOrder.info({orderIncrementId: number}, this.onResult(resolve, reject));
    });
  }

  async product(sku){
    return this.onInstance((api, resolve, reject) => {
      api.catalogProduct.info({ id: sku }, this.onResult(resolve, reject));
    });
  }

  async updateProductWeight(sku, weight){
    return this.onInstance((api, resolve, reject) => {
      api.catalogProduct.update({
        id:         sku,
        data:       {weight: weight}
      }, this.onResult(resolve, reject));
    });
  }

  async updateProductStock(sku, stock){
    return this.onInstance((api, resolve, reject) => {
      api.catalogInventoryStockItem.update({
        product: sku,
        data: {qty: stock,
          is_in_stock : stock > 0 }
        },this.onResult(resolve, reject));
      });
    }

    async salesOrderUpdate(data){
      return this.onInstance((api, resolve, reject) => {
        api.salesOrder.addComment(data, this.onResult(resolve, reject));
      });
    }



  };
