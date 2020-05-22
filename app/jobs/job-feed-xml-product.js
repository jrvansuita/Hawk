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
        this._updateProducts(() => {
          this._updateNonSyncProducts(() => {
            resolve();
          });
        });

      });
    });
  }

  _updateProducts(callback){
    this.count = 0;
    this.itemCount = 0;
    FeedXml.get((xml) => {
      if (xml){
        var items = xml.feed.item;
        items.forEach((item, index) => {
          var sku = FeedXml.val(item, "sku");

          if (!sku.includes('-')){
            this.itemCount++;

            var name = Util.getProductName(FeedXml.val(item, "name"), sku.includes('-'));
            var brand = FeedXml.val(item, "brand").trim();

            var url = FeedXml.val(item, "link");
            var image = FeedXml.val(item, "image");
            var price = FeedXml.val(item, "price");
            var fromPrice = FeedXml.val(item, "fromPrice");
            var cost = FeedXml.val(item, "cost");

            var discount = FeedXml.val(item, "discount");

            var category = FeedXml.val(item, "department");
            var gender = Str.capitalize(FeedXml.val(item, "gender")).trim();
            var color = Str.capitalize(FeedXml.val(item, "color")).trim();
            var quantity = FeedXml.val(item, "quantity");

            var year = FeedXml.val(item, "collection");
            var season = FeedXml.val(item, "season");
            var age = FeedXml.val(item, "age");
            var manufacturer = FeedXml.val(item, "manufacturer");
            var weight = FeedXml.val(item, "child_weight") || FeedXml.val(item, "weight");


            var visible = FeedXml.val(item, "visible").includes('true');
            var associates = FeedXml.val(item, "associates");


            Product.get(sku, (res) => {
              var newStock = 0;
              this.count++;
              //se o item ja existe faz a diferença, se não é um item novo
              if(res){
                newStock = quantity - res.quantity;
              }

              var product = new Product(sku, name, brand, url,
                image,
                price, fromPrice, cost, discount,
                category, gender, color,
                quantity, newStock, true,
                age, year, season, manufacturer,
                visible, associates, weight
              );
              product.upsert();

              if(this.count == this.itemCount){
                callback();
              }
            });

          }
        });
      }
    });
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
