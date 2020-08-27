const Routes = require('./_route.js');
const ProductProvider = require('../provider/product-provider.js');
const ProductListProvider = require('../provider/product-list-provider.js');
const ProductImageProvider = require('../provider/product-image-provider.js');
const ProductStorer = require('../storer/product/product.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const Enum = require('../bean/enumerator');
const ProductBoardProvider = require('../provider/board/product-board-provider.js');

const StockOrderVault = require('../vault/stock-order-vault');
const StockOrderProvider = require('../provider/stock-order-provider');
const StockOrderHandler = require('../handler/stock-order-handler.js');
const AttributesHandler = require('../handler/attributes-handler.js')

module.exports = class ProductRoutes extends Routes {
  mainPath() {
    return '/stock';
  }

  attach() {
    this.page('/list', async (req, res) => {
      res.locals.productListQuery = req.body.query || req.session.productListQuery;

      res.render('product/board/product-list', { colors: await Enum.on('COLOR-LIST').get() });
    }).market();

    this.post('/list', (req, res) => {
      req.session.productListQuery = req.body.query;
      this._resp().success(res);
    }).market();

    this.get('/list-page', (req, res) => {
      req.session.productListQuery = req.query.query;
      new ProductListProvider(res.locals.loggedUser).with(req.query.query, req.query.page).load((data, info) => {
        this._resp().success(res, { data, info, query: req.query.query });
      });
    }).market();

    this.get('/list-export', (req, res, locals) => {
      if (req.query.skus) {
        req.query.skus = typeof req.query.skus === 'string' ? req.query.skus.split(',') : req.query.skus;
      }
      var query = req.query.skus ? req.query.skus : req.session.productListQuery;

      new ProductListProvider(res.locals.loggedUser).with(query, null).load(data => {
        new EccosysProvider()
          .skus(
            data.map(e => {
              return e.sku;
            })
          )
          .go(products => {
            var result = {};
            products.forEach(each => {
              each?._Skus?.forEach(c => {
                result[c.codigo] = c.gtin;
              });
            });

            res.render('product/board/product-list-export', { data: data, eans: result });
          });
      });
    }).market();

    this.get('/multiple-imgs', (req, res) => {
      const fs = require('fs');

      req.query.skus = typeof req.query.skus === 'string' ? req.query.skus.split(',') : req.query.skus;

      new ProductImageProvider(req.query.skus).load().then(zipFilePath => {
        res.setHeader('Content-disposition', 'attachment; filename=imagens.zip');
        res.setHeader('Content-type', 'application/zip');

        var filestream = fs.createReadStream(zipFilePath);
        filestream.pipe(res);
      });
    });

    /** --------------  Product Storer -------------- **/

    this.page('/storer', (req, res) => {
      new ProductProvider()
        .withImage()
        .setSku(req.query.sku, true)
        .setEan(req.query.ean, req.query.order)
        .get(product => {
          res.render('product/storer/product', {
            product: product,
          });
        });
    });

    this.post('/storer-upsert', async (req, res) => {
      var storer = await new ProductStorer().with(res.locals.loggedUser, req.body);
      storer.setOnFinished(this._resp().redirect(res)).upsert();
    });

    this.post('/storer-delete', (req, res) => {
      new ProductStorer().with(req.body).delete(this._resp().redirect(res));
    });

    this.get('/storer-attr', (req, res) => {
      new ProductStorer().searchAttr(req.query.attr, this._resp().redirect(res), req.query.useCache);
    });

    this.post('/refresh-attrs', (req, res) => {
      new AttributesHandler().clearCache(this._resp().redirect(res))
    });

    /** --------------  Product Board -------------- **/
    this.page('/product-board', (req, res) => {
      res.render('product/board/product-board');
    }).market();

    this.post('/board-data', (req, res) => {
      new ProductBoardProvider(res.locals.loggedUser)
        .with(req.body)
        .maybe(req.session.productBoardQueryId)
        .setOnError(err => {
          this._resp().error(res, err);
        })
        .setOnResult(result => {
          req.session.productBoardQueryId = result.id;
          this._resp().success(res, result);
        })
        .load();
    }).market();
    /** --------------  Product Board -------------- **/

    this.get('/panel', (req, res) => {
      new StockOrderProvider().getAll(orders => {
        res.render('product/panel/product-panel', { orders: orders });
      });
    });

    this.post('/new-order', (req, res) => {
      req.body.user = req.session.loggedUser;
      StockOrderVault.storeFromScreen(req.body, order => {
        this._resp().success(res, order);
      });
    }).market();

    this.get('/stock-order-attr', (req, res) => {
      new StockOrderProvider().searchAttr(req.query.attr, this._resp().redirect(res));
    }).market();

    this.post('/delete-order', (req, res) => {
      StockOrderVault.delete(req.body.orderId, this._resp().redirect(res));
    });

    this.post('/update-order-status', (req, res) => {
      new StockOrderHandler().updateStatus(req.body.orderId, req.session.loggedUser, this._resp().redirect(res));
    });

    this.get('/get-orders', (req, res) => {
      new StockOrderProvider().search(req.query, data => {
        this._resp().success(res, data);
      });
    });

    this.post('/order-attach-upload', (req, res) => {
      StockOrderVault.uploadAttach(req.files.attach, fileId => {
        this._resp().success(res, fileId);
      });
    }).market();

    this.post('/order-attach-delete', (req, res) => {
      StockOrderVault.deleteAttach(req.body.fileId, (result) => {
        this._resp().success(res, result);
      });
    });

    this.get('/scheduling', (req, res) => {
      res.render('product/panel/scheduling');
    }).market();
  }
};
