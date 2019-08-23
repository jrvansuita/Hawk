const Controller = require('../jobs/controller/controller.js');

const FeedXml = require('../feedxml/feed-xml.js');
const Product = require('../bean/product.js');
const History = require('../bean/history.js');


module.exports = class JobProducts extends Controller{

  run(callback){
    var controller = this;

    History.job('Atualização de Produtos', 'Atualizando produtos através do feed xml', 'XML');

    Product.updateAll({quantity : {$gt: 0}},{quantity: 0}, (err, dos)=>{
      //Zera as quantidades em estoque para depois atualizar.

      //await sleep(2000);

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

              var category = FeedXml.val(item, "department");
              var gender = Str.capitalize(FeedXml.val(item, "gender")).trim();
              var color = Str.capitalize(FeedXml.val(item, "color")).trim();
              var quantity = FeedXml.val(item, "quantity");

              var year = FeedXml.val(item, "collection");
              var season = FeedXml.val(item, "season");
              var age = FeedXml.val(item, "age");

              var visible = FeedXml.val(item, "visible").includes('Busca');
              var associates = FeedXml.val(item, "associates");

              var product = new Product(sku, name, brand, url,
                image, price, category,
                gender, color, quantity,
                age, year, season, visible, associates);

                product.upsert();

              }
            });



            controller.terminate();
            console.log('Atualização de produtos concluída');

            if (callback){
              callback();
            }

          }
        });

      });

    }
  };





  /*function sleep(ms){
  return new Promise(resolve=>{
  setTimeout(resolve,ms)
})
}*/
