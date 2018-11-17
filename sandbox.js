require('./app/init/init.js');


//const SaleItemSwapper = require('./app/swap/sale-item-swapper.js');

//new SaleItemSwapper('121152', 404).on('CB003vm-G').to('PS506az-4').with(1).go();


//-----

const SaleLoader = require('./app/loader/sale-loader.js');

new SaleLoader('192663').run((sale)=>{
  console.log(sale);
});
