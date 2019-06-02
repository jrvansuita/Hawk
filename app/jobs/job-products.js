const Controller = require('../jobs/controller/controller.js');

const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');
const History = require('../bean/history.js');


module.exports = class JobProducts extends Controller{

  run(){
    var controller = this;

    History.job('Atualização de Produtos', 'Atualizando produtos através do feed xml', 'XML');

    FeedXml.get((xml) =>{
      if (xml){
        var items = xml.feed.item;
        items.forEach((item, index) => {

          var sku = FeedXml.val(item, "sku");
          var name = Util.getProductName(FeedXml.val(item, "name"), sku.includes('-'));
          var brand = FeedXml.val(item, "brand").trim();

          var url = FeedXml.val(item, "link");
          var image = FeedXml.val(item, "image");
          var price = FeedXml.val(item, "price");

          var category = FeedXml.val(item, "department");
          var gender = Str.capitalize(FeedXml.val(item, "gender")).trim();
          var color = Str.capitalize(FeedXml.val(item, "color")).trim();
          var quantity = FeedXml.val(item, "quantity");

          var year = FeedXml.val(item, "collection");
          var season = FeedXml.val(item, "season");
          var age = FeedXml.val(item, "age");

          var product = new Product(sku, name, brand, url,
            image, price, category,
            gender, color, quantity,
            age, year, season);

            product.upsert();
          });

          controller.terminate();
        }
      });
    }
  };
