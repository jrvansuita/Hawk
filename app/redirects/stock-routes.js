const Routes = require('../redirects/controller/routes.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductHandler = require('../handler/product-handler.js');

module.exports = class ProductRoutes extends Routes{

  attach(){

    this._get('/product-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, this._resp().redirect(res));
    });

    this._get('/sku-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product)=>{
        res.redirect(product ? product.image : null);
      });
    });

    this._get('/product-child', (req, res) => {
      ProductHandler.getBySku(req.query.sku, false, this._resp().redirect(res));
    });

    this._get('/product-stock-history', (req, res) => {
      ProductHandler.getStockHistory(req.query.sku, this._resp().redirect(res));
    });

    this._get('/product-search-autocomplete', (req, res) => {
      ProductHandler.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

    this._page('/stock', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, (result)=>{
        res.render('product',{
          product : result
        });
      });
    });

    this._post('/product-local', (req, res) => {
      ProductHandler.updateLocal(req.body.sku, req.body.local, req.body.user, this._resp().redirect(res));
    });

    this._post('/product-ncm', (req, res) => {
      ProductHandler.updateNCM(req.body.sku, req.body.ncm, res.locals.loggedUser, this._resp().redirect(res));
    });

    this._post('/product-stock', (req, res) => {
      ProductHandler.updateStock(req.body.sku, req.body.stock, req.body.user, this._resp().redirect(res));
    });






}};
