
const Product = require('../bean/product.js');
const ProductHandler = require('../handler/product-handler.js');

module.exports = {

  load(eanOrSku, callback){
    if (eanOrSku){
      ProductHandler.get(eanOrSku, true, (product)=>{
        if (product){
          handleAttrs(product, callback);
        }else{
          callback({
            selected: eanOrSku,
            error: 'Nenhum produto com o(s) código(s) informado(s) foi encontrado.'});
        }
      });
    }else{
      callback({});
    }
  },

  updateLocal(sku, newLocal, user, callback){
    ProductHandler.updateLocal(sku, newLocal,user,callback);
  }


};

function handleAttrs(product, callback){
  ProductHandler.getImage(product.codigo, (img)=>{
    //Get the product Image
    product.img = img;

    //Handle the products attirbutes
    product._Atributos.forEach((attr)=>{
      product[attr.descricao] = attr.valor;
    });

    callback(product);
  });
}
