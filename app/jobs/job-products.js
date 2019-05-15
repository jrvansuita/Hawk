const Controller = require('../jobs/controller/controller.js');

const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');
const History = require('../bean/history.js');


module.exports = class JobProducts extends Controller{

  run(){
    var controller = this;

    History.job('Atualização de Produtos', 'Atualizando produtos através do feed xml', 'XML');

    FeedXml.get((xml) =>{
      var items = xml.rss.channel[0].item;
      items.forEach((item, index) => {

        var title = FeedXml.val(item, "title");


        var sku = FeedXml.val(item, "id");
        var name = Util.getProductName(title, sku.includes('-'));
        var brand = FeedXml.val(item, "brand");

        var url = FeedXml.val(item, "link");
        var image = FeedXml.val(item, "image_link");
        var price = FeedXml.val(item, "price");

        var types = FeedXml.val(item, "product_type").split('>');
        var category = types[types.length-1].trim();
        var gender = FeedXml.val(item, "gender");
        var color = FeedXml.val(item, "color");
        var quantity = FeedXml.val(item, "quantity");

        var product = new Product(sku, name, brand, url, image, price, category, gender, color, quantity);
        product.upsert();
      });

      controller.terminate();
    });
  }
};
