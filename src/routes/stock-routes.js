const Routes = require('./_route.js');
const ProductLaws = require('../laws/product-laws.js');
const ProductListProvider = require('../provider/product-list-provider.js');
const ProductImageProvider = require('../provider/product-image-provider.js');
const ProductStorer = require('../storer/product/product.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const Enum = require('../bean/enumerator');
const ProductBoardProvider = require('../provider/board/product-board-provider.js');

const StockOrderVault = require('../vault/stock-order-vault');
const StockOrderProvider = require('../provider/stock-order-provider');
const StockOrderHandler = require('../handler/stock-order-handler.js');

module.exports = class ProductRoutes extends Routes {
  mainPath() {
    return '/stock';
  }

  attach() {
    this._page('/list', async (req, res) => {
      res.locals.productListQuery = req.body.query || req.session.productListQuery;

      res.render('product/board/product-list', { colors: await Enum.on('COLOR-LIST').get() });
    });

    this._post('/list', (req, res) => {
      req.session.productListQuery = req.body.query;
      this._resp().sucess(res);
    });

    this._get('/list-page', (req, res) => {
      req.session.productListQuery = req.query.query;
      ProductListProvider.load(req.query.query, req.query.page, (data, info) => {
        this._resp().sucess(res, { data, info, query: req.query.query });
      });
    });

    this._get('/list-export', (req, res, locals) => {
      if (req.query.skus) {
        req.query.skus = typeof req.query.skus === 'string' ? req.query.skus.split(',') : req.query.skus;
      }
      var query = req.query.skus ? req.query.skus : req.session.productListQuery;

      ProductListProvider.load(query, null, data => {
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
    });

    this._get('/multiple-imgs', (req, res) => {
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

    this._page('/storer', (req, res) => {
      var skuOrEan = req.query.sku || req.query.ean;

      ProductLaws.load(skuOrEan, result => {
        res.render('product/storer/product', {
          product: result,
        });
      });
    });

    this._post('/storer-upsert', async (req, res) => {
      var storer = await new ProductStorer().with(res.locals.loggedUser, req.body);
      storer.setOnFinished(this._resp().redirect(res)).upsert();
    });

    this._post('/storer-delete', (req, res) => {
      new ProductStorer().with(req.body).delete(this._resp().redirect(res));
    });

    this._get('/storer-attr', (req, res) => {
      new ProductStorer().searchAttr(req.query.attr, this._resp().redirect(res), req.query.useCache);
    });

    /** --------------  Product Board -------------- **/
    this._page('/product-board', (req, res) => {
      res.render('product/board/product-board');
    });

    this._post('/board-data', (req, res) => {
      new ProductBoardProvider()
        .with(req.body)
        .maybe(req.session.productBoardQueryId)
        .setOnError(err => {
          this._resp().error(res, err);
        })
        .setOnResult(result => {
          req.session.productBoardQueryId = result.id;
          this._resp().sucess(res, result);
        })
        .load();
    });
    /** --------------  Product Board -------------- **/

    this._get('/panel', (req, res) => {
      new StockOrderProvider().getAll(orders => {
        res.render('product/panel/product-panel', { orders: orders });
      });
    });

    this._post('/new-order', (req, res) => {
      req.body.user = req.session.loggedUser;
      StockOrderVault.storeFromScreen(req.body, order => {
        res.redirect('/stock/panel');
      });
    });

    this._get('/stock-order-attr', (req, res) => {
      new StockOrderProvider().searchAttr(req.query.attr, this._resp().redirect(res));
    });

    this._post('/delete-order', (req, res) => {
      StockOrderVault.delete(req.body.orderId, this._resp().redirect(res));
    });

    this._post('/update-order-status', (req, res) => {
      new StockOrderHandler().updateStatus(req.body.orderId, req.session.loggedUser, this._resp().redirect(res));
    });

    this._get('/get-orders', (req, res) => {
      new StockOrderProvider().search(req.query, data => {
        this._resp().sucess(res, data);
      });
    });

    this._post('/order-attach-upload', (req, res) => {
      StockOrderVault.uploadAttach(req.files.attach, fileId => {
        this._resp().sucess(res, fileId)
     })
    });
  }
};
