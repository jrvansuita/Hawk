const Job = require('../jobs/controller/job.js');

const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');
const ProductBoardEmailHandler = require('../performance/product-board-email.js');

module.exports = class JobFeedXmlProducts extends Job{

  getName(){
    return 'Atualização de Produtos';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      //define todos como sync = false
      Product.updateAll({}, {sync: false}, (err, dos)=>{
        this._handleAllSkus(() => {
          this._updateNonSyncProducts(() => {
            resolve();
          });
        });

      });
    });
  }

  _handleAllSkus(callback){
    FeedXml.get((xml) => {
      if (xml){
        var current = -1;
        var items = xml.feed.item;

        var innerHandleAllSkus = (onFinished) => {
          current++;

          if (current == items.length){
            onFinished();
          }else{
            this._handleEachSku(items[current], () => {
              innerHandleAllSkus(onFinished);
            });
          }
        };


        innerHandleAllSkus(callback);
      }else{
        callback();
      }
    });
  }

  _handleEachSku(data, callback){
    var product = this.getXmlItemLoaded(data);

    if (product.sku.includes('-')){
      if(callback){
        callback();
      }
    }else{
      Product.get(product.sku, (responseProduct) => {
        product.newStock = (product.quantity - (responseProduct ? responseProduct.quantity : product.quantity));
        product.sync = true;

        product.upsert();

        if(callback){
          callback();
        }
      });
    }
  }

  getXmlItemLoaded(item){
    var sku = FeedXml.val(item, "sku");

    return new Product(
      sku,
      Util.getProductName(FeedXml.val(item, "name"), sku.includes('-')),
      FeedXml.val(item, "brand").trim(),
      FeedXml.val(item, "link"),
      FeedXml.val(item, "image"),
      FeedXml.val(item, "price"),
      FeedXml.val(item, "fromPrice"),
      FeedXml.val(item, "cost"),
      FeedXml.val(item, "discount"),
      FeedXml.val(item, "department"),
      Str.capitalize(FeedXml.val(item, "gender")).trim(),
      Str.capitalize(FeedXml.val(item, "color")).trim(),
      FeedXml.val(item, "quantity"),
      0,
      true,
      FeedXml.val(item, "age"),
      FeedXml.val(item, "collection"),
      FeedXml.val(item, "season"),
      FeedXml.val(item, "manufacturer"),
      FeedXml.val(item, "visible").includes('true'),
      FeedXml.val(item, "associates"),
      FeedXml.val(item, "child_weight") || FeedXml.val(item, "weight")
    );
  }

  _updateNonSyncProducts(callback){
    Product.updateAll({sync: false}, {newStock: 0, quantity: 0 }, (err, doc) => {
      if(Params.activePerformanceEmailReport()){
        new ProductBoardEmailHandler().go(() => {});
      }
      callback();
    });
  }

};
