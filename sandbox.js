require('./app/init/init.js');


//const SaleItemSwapper = require('./app/swap/sale-item-swapper.js');

//new SaleItemSwapper('121152', 404).on('CB003vm-G').to('PS506az-4').with(1).go();


//-----

//const SaleLoader = require('./app/loader/sale-loader.js');

//new SaleLoader('192663').run((sale)=>{
//  console.log(sale);
//});


const Product = require('./app/bean/product.js');
const EccosysCalls = require('./app/eccosys/eccosys-calls.js');
const ProductHandler = require('./app/handler/product-handler.js');


var index = 0;

Product.findAll((err, products)=>{
  products.slice(0,300).forEach((product)=>{
    EccosysCalls.getProduct(product.sku, (product)=>{
      if (product._Skus){
        product._Skus.forEach((sku)=>{
          EccosysCalls.getProduct(sku.codigo, (child)=>{

            index++;
            console.log(index);

            if (child.localizacao && (/[a-z]/.test(child.localizacao))){
              var newLocal = child.localizacao.toUpperCase();



              console.log(child.codigo + ' : ' + child.localizacao + ' -> ' + newLocal);

              //ProductHandler.updateLocal(child.codigo, newLocal, new User(404, 'Sistema'), ()=>{
              //    console.log(child.codigo + ' : ' + child.localizacao + ' -> ' + newLocal);
              //});


            }
          });
        });
      }
    });
  });
});
