const Job = require('../jobs/controller/job.js');

const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');
const ProductBoardEmailHandler = require('../performance/product-board-email.js');

module.exports = class JobFeedXmlProducts extends Job {
  getName() {
    return 'Atualização de Produtos';
  }

  doWork() {
    return new Promise((resolve, reject) => {
      // define todos como sync = false
      Product.updateAll({}, { sync: false }, () => {
        this._handleAllSkus(() => {
          this._updateNonSyncProducts(() => {
            resolve();
          });
        });
      });
    });
  }

  _handleAllSkus(callback) {
    FeedXml.get((xml) => {
      if (xml) {
        var current = -1;
        var items = xml.feed.item;

        var innerHandleAllSkus = (onFinished) => {
          current++;

          if (current == items.length) {
            onFinished();
          } else {
            this._handleEachSku(items[current], () => {
              innerHandleAllSkus(onFinished);
            });
          }
        };

        innerHandleAllSkus(callback);
      } else {
        callback();
      }
    });
  }

  _handleEachSku(data, callback) {
    if (FeedXml.val(data, 'sku').includes('-')) {
      // É produto filho, não faz nada com ele
      // Produtos filhos nem deveriam estar no feed
      callback();
    } else {
      var product = this.getXmlItemLoaded(data);
      Product.get(product.sku, (responseProduct) => {
        product.newStock = product.quantity - (responseProduct ? responseProduct.quantity : product.quantity);
        product.sync = true;

        product.upsert();

        if (callback) {
          callback();
        }
      });
    }
  }

  getXmlItemLoaded(item) {
    var sku = FeedXml.val(item, 'sku');

    return new Product(
      sku,
      global.Util.getProductName(FeedXml.val(item, 'name'), sku.includes('-')),
      FeedXml.val(item, 'brand'),
      FeedXml.val(item, 'link'),
      FeedXml.val(item, 'image'),
      FeedXml.val(item, 'price'),
      FeedXml.val(item, 'fromPrice'),
      FeedXml.val(item, 'cost'),
      FeedXml.val(item, 'discount'),
      FeedXml.val(item, 'department'),
      global.Str.capitalize(FeedXml.val(item, 'gender')),
      global.Str.capitalize(FeedXml.val(item, 'color')),
      FeedXml.val(item, 'quantity'),
      0,
      true,
      FeedXml.val(item, 'age'),
      FeedXml.val(item, 'collection'),
      FeedXml.val(item, 'season'),
      FeedXml.val(item, 'manufacturer'),
      FeedXml.val(item, 'visible').includes('true'),
      FeedXml.val(item, 'associates'),
      FeedXml.val(item, 'child_weight') || FeedXml.val(item, 'weight'),
      FeedXml.val(item, 'category')
    );
  }

  _updateNonSyncProducts(callback) {
    Product.updateAll({ sync: false }, { newStock: 0, quantity: 0 }, (_err, doc) => {
      if (global.Params.activePerformanceEmailReport()) {
        new ProductBoardEmailHandler().go(() => {});
      }
      callback();
    });
  }
};
