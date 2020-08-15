const Routes = require('./_route.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductProvider = require('../provider/product-provider.js');
const ProductImageProvider = require('../provider/product-image-provider.js');

module.exports = class ProductRoutes extends Routes {
  mainPath() {
    return '/product';
  }

  attach() {
    /* ---- Redirects ---- */

    this.get('/image', (req, res) => {
      new ProductImageProvider().getImage(req.query.sku, this._resp().redirect(res));
    })
      .skipLogin()
      .market()
      .cors();

    this.get('/image-redirect', (req, res) => {
      new ProductImageProvider().getImage(req.query.sku, (product) => {
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.image ? product.image : req.query.def);
      });
    })
      .skipLogin()
      .cors()
      .market();

    this.get('/url-redirect', (req, res) => {
      new ProductImageProvider().getImage(req.query.sku, (product) => {
        res.set('Cache-Control', 'public, max-age=86400'); // 1day
        res.redirect(product && product.url ? product.url : req.query.def);
      });
    })
      .skipLogin()
      .cors()
      .market();

    /* ---- Get Product ---- */

    this.get('/child', (req, res) => {
      new ProductProvider(res.locals.loggedUser).setSku(req.query.sku).get(this._resp().redirect(res));
    });

    this.get('/skus', (req, res) => {
      new ProductProvider(res.locals.loggedUser).setSkus(req.query.skus, req.query.order).get(this._resp().redirect(res));
    }).market();

    this.get('/stock-history', (req, res) => {
      ProductHandler.getStockHistory(req.query.sku, this._resp().redirect(res));
    }).market();

    this.get('/search-autocomplete', (req, res) => {
      ProductHandler.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

    this.get('', (req, res) => {
      new ProductProvider(res.locals.loggedUser).withImage().setSku(req.query.sku, false).setEan(req.query.ean, req.query.order).get(this._resp().redirect(res));
    }).apiRead();

    /* ---- Render ---- */

    this.page('/page', (req, res) => {
      new ProductProvider(res.locals.loggedUser)
        .withImage()
        .setSku(req.query.sku, true)
        .setEan(req.query.ean, req.query.order)
        .get((product) => {
          console.log(product);
          res.render('product/stock/product', {
            product: product,
          });
        });
    }).market();

    this.get('/print-locals', (req, res) => {
      if (req.query.product) {
        res.render('product/printing/local-list', { product: req.query.product });
      } else {
        new ProductProvider(res.locals.loggedUser).setSku(req.query.sku, false).get((result) => {
          res.render('product/printing/local-list', {
            product: result,
          });
        });
      }
    });

    this.post('/active', (req, res) => {
      if (req.body.forceSingle) {
        ProductLaws.activeSingle(req.body.sku, req.body.active, req.body.user, this._resp().redirect(res));
      } else {
        ProductLaws.active(req.body.sku, req.body.active, req.body.user, this._resp().redirect(res));
      }
    });

    this.post('/local', (req, res) => {
      ProductLaws.updateLocal(req.body.sku, req.body.local, req.body.user, req.query.device || req.headers.device, this._resp().redirect(res));
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
      ProductLaws.updateStock(req.body.sku, req.body.stock, req.body.user, req.query.device || req.headers.device, this._resp().redirect(res));
    }).api();

    this.post('/ncm', (req, res) => {
      ProductLaws.updateNCM(req.body.sku, req.body.ncm, res.locals.loggedUser, this._resp().redirect(res));
    });

    this.post('/weight', (req, res) => {
      ProductLaws.updateWeight(req.body.sku, req.body.weight, req.body.user, this._resp().redirect(res));
    });

    this.get('/barcode', (req, res) => {
      new ProductProvider(res.locals.loggedUser)
        .setSku(req.query.sku, false)
        .setEan(req.query.ean)
        .get((result) => {
          res.render('product/printing/barcode', {
            product: result,
          });
        });
    });
  }
};
