const Routes = require('../redirects/controller/routes.js');
const ProductLaws = require('../laws/product-laws.js');

module.exports = class ProductRoutes extends Routes{

  attach(){

    this._get('/product-image', (req, res) => {
      ProductLaws.getImage(req.query.sku, this._resp().redirect(res));
    });

    this._get('/product-child', (req, res) => {
      ProductLaws.get(req.query.sku, false, this._resp().redirect(res));
    });

    this._get('/stock', (req, res) => {
      ProductLaws.get(req.query.sku, true, (result)=>{
        res.render('product',{
          product : result
        });
      });
    });



}};
