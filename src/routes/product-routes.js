const Routes = require('./_route.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductHandler = require('../handler/product-handler.js');

module.exports = class ProductRoutes extends Routes {
  mainPath() {
    return '/product';
  }

  attach() {
    /* ---- Redirects ---- */

    this.get('/image', (req, res) => {
      ProductHandler.getImage(req.query.sku, this._resp().redirect(res));
    })
      .skipLogin()
      .cors();

    this.get('/image-redirect', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product) => {
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.image ? product.image : req.query.def);
      });
    })
      .skipLogin()
      .cors()
      .market();

    this.get('/url-redirect', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product) => {
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.url ? product.url : req.query.def);
      });
    })
      .skipLogin()
      .cors()
      .market();

    /* ---- Get Product ---- */

    this.get('/child', (req, res) => {
      ProductHandler.getBySku(req.query.sku, false, this._resp().redirect(res));
    });

    this.get('/skus', (req, res) => {
      ProductHandler.getSkus(req.query.skus, req.query.order, this._resp().redirect(res));
    });

    this.get('/stock-history', (req, res) => {
      ProductHandler.getStockHistory(req.query.sku, this._resp().redirect(res));
    });

    this.get('/search-autocomplete', (req, res) => {
      ProductHandler.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

    this.get('', (req, res) => {
      ProductLaws.get(req.query.sku || req.query.ean, false, this._resp().redirect(res));
    }).apiRead();

    /* ---- Render ---- */

    this.page('/page', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, (result) => {
        res.render('product/stock/product', {
          product: result,
        });
      });
    });

    this.get('/print-locals', (req, res) => {
      if (req.query.product) {
        res.render('product/printing/local-list', { product: req.query.product });
      } else {
        ProductHandler.getBySku(req.query.sku, false, (result) => {
          res.render('product/printing/local-list', {
            product: result,
          });
        });
      }
    });

    this.post('/active', (req, res) => {
      if (req.body.forceSingle) {
        ProductHandler.activeSingle(req.body.sku, req.body.active, req.body.user, this._resp().redirect(res));
      } else {
        ProductHandler.active(req.body.sku, req.body.active, req.body.user, this._resp().redirect(res));
      }
    });

    this.post('/local', (req, res) => {
      ProductHandler.updateLocal(req.body.sku, req.body.local, req.body.user, req.query.device || req.headers.device, this._resp().redirect(res));
    }).api();

    /**
     * @api {post} /product/stock Stock Quantity
     * @apiGroup Product
     * @apiParam {String} device Mobile or Desktop
     * @apiParam {String} sku Product SKU
     * @apiParam {Integer} stock New product stock quantity
     * @apiParam {User} user Logged User entity
     * @apiParamExample Body-Example:
     *     {
     *       "sku": "CB318az-P",
     *       "stock": 25
     *       "user" : {...}
     *     }
     * @apiParamExample Header-Example:
     *     {
     *       "device": "Mobile"
     *     }
     */

    this.post('/stock', (req, res) => {
      ProductHandler.updateStock(req.body.sku, req.body.stock, req.body.user, req.query.device || req.headers.device, this._resp().redirect(res));
    }).api();

    this.post('/ncm', (req, res) => {
      ProductHandler.updateNCM(req.body.sku, req.body.ncm, res.locals.loggedUser, this._resp().redirect(res));
    });

    this.post('/weight', (req, res) => {
      ProductHandler.updateWeight(req.body.sku, req.body.weight, req.body.user, this._resp().redirect(res));
    });

    this.get('/barcode', (req, res) => {
      ProductHandler.get(req.query.sku, false, (result) => {
        res.render('product/printing/barcode', {
          product: result,
        });
      });
    });
  }
};
