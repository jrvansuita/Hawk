require('./app/init/init.js');


const SalesLoader = require('./app/loader/sale-loader.js');


new SalesLoader('199500')
  .loadItems()
  .loadClient()
  .run((sale)=>{
    console.log(sale);
  });
