const Routes = require('../redirects/controller/routes.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductDiagnostics = require('../diagnostics/product-diagnostics.js');
const DiagnosticsProvider = require('../diagnostics/diagnostics-provider.js');
const DiagnosticsEnum = require('../diagnostics/diagnostics-enum.js');
const ProductBoard = require('../provider/product-board-provider.js');
const ProductListProvider = require('../provider/product-list-provider.js');
const ProductImageProvider = require('../provider/product-image-provider.js');
const ProductStorer = require('../storer/product/product.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = class ProductRoutes extends Routes{

  attach(){
    this._get('/product-image', (req, res) => {
      ProductHandler.getImage(req.query.sku, this._resp().redirect(res));
    });

    this._get('/product-image-redirect', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product)=>{
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.image ? product.image : req.query.def);
      });
    }, true, true);

    this._get('/product-url-redirect', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product)=>{
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.url ? product.url : req.query.def);
      });
    }, true, true);

    this._get('/product-child', (req, res) => {
      ProductHandler.getBySku(req.query.sku, false, this._resp().redirect(res));
    });

    this._get('/product-skus', (req, res) => {
      ProductHandler.getSkus(req.query.skus, this._resp().redirect(res));
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
        res.render('product/stock/product',{
          product : result
        });
      });
    });

    this._get('/product-print-locals', (req, res) => {
      if(req.query.product){
        res.render('product/printing/local-list', {product : req.query.product});
      }else{
        ProductHandler.getBySku(req.query.sku, false, (result)=>{
          res.render('product/printing/local-list',{
            product : result
          });
        });
      }
    });


    this._post('/product-active', (req, res) => {
      if (req.body.forceSingle){
        ProductHandler.activeSingle(req.body.sku, req.body.active,  req.body.user, this._resp().redirect(res));
      }else{
        ProductHandler.active(req.body.sku, req.body.active,  req.body.user, this._resp().redirect(res));
      }
    });


    this._page('/diagnostics', (req, res) => {
      new DiagnosticsProvider().sums((data)=>{
        res.render('product/diagnostics/diagnostics', {sums : data, types: DiagnosticsEnum});
      });
    });

    this._post('/check-product-diagnostic', (req, res) => {
      new ProductDiagnostics().resync(req.body.sku, req.body.forceFather, ()=>{
        new DiagnosticsProvider().loadBySku(req.body.sku, (all, product)=>{
          res.status(200).send({data : all, product: product});
        });
      });
    });

    this._post('/run-product-diagnostics', (req, res) => {

      if (req.body.refresh){
        new ProductDiagnostics().refresh(req.body.brand, req.body.type);
      }else{
        new ProductDiagnostics().sync();
      }

      res.status(200).send('Ok');
    });

    this._get('/product-fixes', (req, res) => {
      if (req.query.type){
        new DiagnosticsProvider().loadByType(req.query.type, (all)=>{
          this._resp().sucess(res, all);
        });
      }else{
        new DiagnosticsProvider().findBySku(req.query.sku, (all)=>{
          res.set('Cache-Control', 'public, max-age=86400');

          var result = [];
          // 1day
          all.forEach((each) => {
            var s = each.toObject();
            s.data=  DiagnosticsEnum[each.type];

            result.push(s);
          });

          this._resp().sucess(res, result);
        });
      }
    });

    this._get('/fixes-dialog', (req, res) => {
      new DiagnosticsProvider().loadBySku(req.query.sku, (all, product)=>{
        res.render('product/diagnostics/diagnostics-dialog', {data : all, product: product, types: DiagnosticsEnum});
      });
    });


    this._post('/product-diagnostic-remove', (req, res) => {
      new ProductDiagnostics().remove(req.body.sku);
      res.status(200).send('Ok');
    });


    this._post('/product-local', (req, res) => {
      ProductHandler.updateLocal(req.body.sku, req.body.local, req.body.user, req.query.device, this._resp().redirect(res));
    }, true);

    this._post('/product-ncm', (req, res) => {
      ProductHandler.updateNCM(req.body.sku, req.body.ncm, res.locals.loggedUser, this._resp().redirect(res));
    });

    this._post('/product-stock', (req, res) => {
      ProductHandler.updateStock(req.body.sku, req.body.stock, req.body.user, req.query.device, this._resp().redirect(res));
    }, true);

    this._post('/product-weight', (req, res) => {

      ProductHandler.updateWeight(req.body.sku, req.body.weight, req.body.user,  this._resp().redirect(res));
    });

    this._get('/barcode', (req, res) => {
      ProductHandler.get(req.query.sku, false, (result)=>{
        res.render('product/printing/barcode',{
          product : result
        });
      });
    });

    this._page('/product-board', (req, res) => {
      ProductBoard.run((result)=>{
        res.render('product/board/board',{
          data : result
        });
      });
    });

    this._post('/product-board-reset', (req, res) => {
      const JobProducts = require('../jobs/job-feed-xml-product.js');
      new JobProducts()
      .doWork().then(() => {
        ProductBoard.reset();
      })

      this._resp().sucess(res);
    });

    this._page('/product-list', (req, res) => {
      res.locals.productListQuery = req.body.query || req.session.productListQuery;
      res.render('product/board/product-list');
    });

    this._post('/product-list', (req, res) => {
      req.session.productListQuery = req.body.query;
      this._resp().sucess(res);
    });

    this._get('/product-list-page', (req, res) => {
      req.session.productListQuery = req.query.query;
      ProductListProvider.load(req.query.query, req.query.page, (data, info)=>{
        this._resp().sucess(res, {data, info});
      });
    });

    this._get('/product-list-export', (req, res) => {
      ProductListProvider.load(req.session.productListQuery, null, (data, info)=>{
        new EccosysProvider().skus(data.map((e)=>{return e.sku})).go((skus) => {

          var result = {};
          skus.forEach((each) => {
            if (each._Skus){
              each._Skus.forEach((eachChild) => {
                 result[eachChild.codigo] = eachChild.gtin;
              });
            }
          });
          res.render('product/board/product-list-export', {data: data, eans:result});
        });
      });
    });


    this._get('/product-multiple-imgs', (req, res) => {
      let fs = require('fs')

      req.query.skus = typeof req.query.skus == 'string' ? req.query.skus.split(',') : req.query.skus;

      new ProductImageProvider(req.query.skus).load().then((zipFilePath) => {

        res.setHeader('Content-disposition', 'attachment; filename=imagens.zip');
        res.setHeader('Content-type', 'application/zip');

        var filestream = fs.createReadStream(zipFilePath);
        filestream.pipe(res);
      });
    });


    /** --------------  Product Storer -------------- **/


    this._page('/stock/storer', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, (result)=>{
        res.render('product/storer/product',{
          product : result
        });
      });
    });

    this._post('/stock/storer-upsert', (req, res) => {
      new ProductStorer().with(req.body).setOnFinished(this._resp().redirect(res)).upsert();
    });

    this._post('/stock/storer-delete', (req, res) => {
      new ProductStorer().with(req.body).delete(this._resp().redirect(res));
    });

    this._get('/stock/storer-attr', (req, res) => {
      new ProductStorer().searchAttr(req.query.attr, this._resp().redirect(res));
    });


  }
};
