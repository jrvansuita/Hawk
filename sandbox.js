
const Initilizer = require('./app/abra-cadabra/initializer.js');


new Initilizer(__dirname, true).begin(() => {

  const SaleLoader = require('./app/loader/sale-loader.js');


  var loader = new SaleLoader('844949');

  loader.loadItems()
  .loadItemsDeepAttrs(null, (item, product) => {
    item.cost = product.precoCusto;
    item.gender = product.Genero;
    item.season = product.Estacao;
    item.category = product.Departamento;
    item.manufacturer = product.Fabricante;
    item.brand = product.Marca;
    if (item.codigo.includes('CB545am')){
      console.log(product);
    }
  })
  .setOnError(this.onError)
  .run((sale) => {

  });

});
