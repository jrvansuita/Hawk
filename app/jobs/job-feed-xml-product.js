const Job = require('../jobs/controller/job.js');


const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');



module.exports = class JobFeedXmlProducts extends Job{

  getName(){
    return 'Atualização de Produtos';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      Product.updateAll({quantity : {$gt: 0}},{quantity: 0}, (err, dos)=>{
        //Zera as quantidades em estoque para depois atualizar.

        FeedXml.get((xml) => {
          if (xml){
            var items = xml.feed.item;
            items.forEach((item, index) => {

              var sku = FeedXml.val(item, "sku");

              if (!sku.includes('-')){
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


                var product = new Product(sku, name, brand, url,
                  image,
                  price, fromPrice, cost, discount,
                  category, gender, color,
                  quantity,
                  age, year, season, manufacturer,
                  visible, associates, weight
                  );

                  product.upsert();
                }
              });

              setTimeout(() => {
                resolve();
              },5000)
            }
          });

        });
      });
    }


  };
