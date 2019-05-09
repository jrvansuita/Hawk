const Routes = require('../redirects/controller/routes.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductDiagnostics = require('../diagnostics/product-diagnostics.js');
const DiagnosticsProvider = require('../diagnostics/diagnostics-provider.js');

module.exports = class ProductRoutes extends Routes{

  attach(){

    this._get('/product-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, this._resp().redirect(res));
    });

    this._get('/sku-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product)=>{
        res.redirect(product && product.image ? product.image : req.query.def);
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

    this._page('/product', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, (result)=>{
        res.render('product/product',{
          product : result
        });
      });
    });

    this._get('/product-print-locals', (req, res) => {
      if(req.query.product){
        res.render('product/local-list', {product : req.query.product});
      }else{
        ProductHandler.getBySku(req.query.sku, false, (result)=>{
          res.render('product/local-list',{
            product : result
          });
        });
      }
    });



    this._page('/diagnostics', (req, res) => {
      new DiagnosticsProvider().sums((data)=>{
        res.render('product/diagnostics', {sums : data});
      });
    });

    this._post('/check-product-diagnostic', (req, res) => {
      new ProductDiagnostics().resync(req.body.sku, ()=>{
        new DiagnosticsProvider().loadBySku(req.body.sku, (all, product)=>{
          res.status(200).send({data : all, product: product});
        });
      });
    });

    this._post('/run-product-diagnostics', (req, res) => {
      new ProductDiagnostics().sync();
      res.status(200).send('Ok');
    });

    this._get('/product-fixes', (req, res) => {
      new DiagnosticsProvider().loadByType(req.query.type, (all)=>{
        this._resp().sucess(res, all);
      });
    });

    this._get('/fixes-dialog', (req, res) => {
      new DiagnosticsProvider().loadBySku(req.query.sku, (all, product)=>{
        res.render('product/diagnostics-dialog', {data : all, product: product});
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

    this._post('/product-weight', (req, res) => {
      ProductHandler.updateWeight(req.body.sku, req.body.weight, req.body.user, this._resp().redirect(res));
    });

    this._get('/barcode', (req, res) => {
      ProductHandler.get(req.query.sku, false, (result)=>{
        res.render('product/barcode',{
          product : result
        });
      });
    });
  }
};
