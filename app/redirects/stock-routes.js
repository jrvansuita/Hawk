const Routes = require('../redirects/controller/routes.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductHandler = require('../handler/product-handler.js');

module.exports = class ProductRoutes extends Routes{

  attach(){

    this._get('/product-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, this._resp().redirect(res));
    });

    this._get('/product-child', (req, res) => {
      ProductHandler.getBySku(req.query.sku, false, this._resp().redirect(res));
    });

    this._get('/product-stock-history', (req, res) => {
      ProductHandler.getStockHistory(req.query.sku, this._resp().redirect(res));
    });

    this._get('/stock', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, (result)=>{
        res.render('product',{
          product : result
        });
      });
    });

    this._post('/product-local', (req, res) => {
      ProductHandler.updateLocal(req.body.sku, req.body.local, res.locals.loggedUser, this._resp().redirect(res));
    });

    this._post('/product-stock', (req, res) => {
      ProductHandler.updateStock(req.body.sku, req.body.stock, res.locals.loggedUser, this._resp().redirect(res));
    });


  



}};
