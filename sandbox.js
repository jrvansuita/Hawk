const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    const SaleLoader = require('./src/loader/sale-loader.js');
    const Sale = require('./src/bean/sale.js');
    var loader = new SaleLoader('932595');

    loader
      .loadItems()
      .loadItemsDeepAttrs(null, (item, product) => {
        item.cost = product.precoCusto;
        item.gender = product.Genero;
        item.season = product.Estacao;
        item.category = product.Departamento;
        item.manufacturer = product.Fabricante;
        item.brand = product.Marca;
      })
      .setOnError(this.onError)
      .run(sale => {
        console.log(sale);
        var s = Sale.from(sale);

        console.log(s);
      });
  });
