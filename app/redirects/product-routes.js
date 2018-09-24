const Routes = require('../redirects/controller/routes.js');
const ProductProvider = require('../provider/ProductProvider.js');

module.exports = class ProductRoutes extends Routes{

  attach(){

    this._get('/product-sku', (req, res) => {
      ProductProvider.get(req.query.sku, (product)=> {
        this._resp().sucess(res, product);
      });
    });

}};
