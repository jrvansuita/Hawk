const Product = require('../bean/product.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductImageProvider = require('../provider/product-image-provider.js');

module.exports = {
  load(eanOrSku, callback) {
    if (eanOrSku) {
      this.get(eanOrSku, true, callback);
    } else {
      // eslint-disable-next-line standard/no-callback-literal
      callback({});
    }
  },

  get(eanOrSku, father, callback) {
    ProductHandler.get(eanOrSku, father, (product) => {
      if (product) {
        handleAttrs(product, callback);
      } else {
        // eslint-disable-next-line standard/no-callback-literal
        callback({
          selected: eanOrSku,
          error: 'Nenhum produto com o(s) código(s) informado(s) foi encontrado.',
        });
      }
    });
  },

  updateLocal(sku, newLocal, user, callback) {
    ProductHandler.updateLocal(sku, newLocal, user, callback);
  },
};

function handleAttrs(product, callback) {
  new ProductImageProvider().getImage(product.codigo, (img) => {
    // Get the product Image
    product.img = img;

    // Handle the products attirbutes
    // product._Atributos.forEach((attr)=>{
    //  product[attr.descricao] = attr.valor;
    // });

    callback(product);
  });
}
