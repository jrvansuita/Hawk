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

        var sku = getVal(item, "id");
        var name = getVal(item, "title");
        var url = getVal(item, "link");
        var image = getVal(item, "image_link");

        var product = new Product(sku, name, url, image);
        product.upsert();
      });

      controller.terminate();
    });
  }
};



function getVal(item, name){
  var data = item["g:" + name] || item[name];

  if (data.length > 0){
    return data[0];

  }
  return '';
}
