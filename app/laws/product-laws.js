const EccosysCalls = require('../eccosys/eccosys-calls.js');
const Product = require('../bean/product.js');


module.exports = {


  get(sku, father, callback){
    if (sku){
      EccosysCalls.getProduct(father ? getFatherSku(sku) : sku , (product)=>{
        product = JSON.parse(product);

        if (typeof product == 'string'){
          callback({error : product, selected : sku});
        }else{
          product.selected = sku;

          this.getImage(sku, (img)=>{
            product.img = img;

            callback(loadAttributes(product));
          });
        }
      });
    }else{
      callback({});
    }
  },

  getImage(sku, callback){
    if (sku){
      Product.findOne(Product.getKeyQuery(getFatherSku(sku)), (err, product)=>{
        callback(product);
      });
    }else{
      callback();
    }
  },

};

function getFatherSku(sku){
  return sku.split('-')[0];
}

function loadAttributes(products){
  products._Atributos.forEach((attr)=>{
    products[attr.descricao] = attr.valor;
  });

  return products;
}
