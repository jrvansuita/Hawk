const Routes = require('./_route.js');
const ProductDiagnostics = require('../diagnostics/product-diagnostics.js');
const DiagnosticsProvider = require('../diagnostics/diagnostics-provider.js');

module.exports = class ProductRoutes extends Routes {
  mainPath() {
    return '/diagnostics';
  }

  attach() {
    this.page('', (req, res) => {
      new DiagnosticsProvider().sums((data, types) => {
        res.render('product/diagnostics/diagnostics', { sums: data, types: types });
      });
    });

    /**
     * @api {post} /diagnostics/check Check Product Fixes
     * @apiGroup Product
     * @apiParam {String} sku Product SKU
     * @apiParam {Boolean} forceFather Force to check only the childs of product
     * @apiParamExample Body-Example:
     *    [
     *     {
     *       "sku": "22645im-6",
     *       "fixes": [
     *            {
     *              "default": false,
     *               "icon": "price",
     *               "description": "Preço de venda não informado ou preço de custo incorreto.",
     *               "name": "Preço de Venda ou Custo Incorreto",
     *                "value": "COST"
     *             }
     *        ]
     *    }
     *  ]
     */

    this.post('/check', (req, res) => {
      new ProductDiagnostics().resync(req.body.sku, req.body.forceFather, () => {
        new DiagnosticsProvider().groupped(true).loadBySku(req.body.sku, (all, product) => {
          res.status(200).send(all);
        });
      });
    }).api();

    this.post('/run', (req, res) => {
      if (req.body.refresh) {
        new ProductDiagnostics().refresh(req.body.brand, req.body.type);
      } else {
        new ProductDiagnostics().sync();
      }

      res.status(200).send('Ok');
    });

    /**
     * @api {get} /diagnostics/fixes Product Diagnostics Fixes
     * @apiGroup Product
     * @apiParam {String} sku Product SKU
     * @apiParam {String} type Product Fix Type
     * @apiParamExample Body-Example:
     *    [
     *       {
     *      "_id": "5efcd598b82d882870c9ab03",
     *      "sku": "22645im-6",
     *      "type": "COST",
     *      "__v": 0,
     *      "date": "2020-07-01T18:27:36.233Z",
     *      "name": "Conjunto Quick And Fast Dog Infantil Marinho - Elian-6"
     *       }
     *    ]
     */

    this.get('/fixes', (req, res) => {
      var provider = new DiagnosticsProvider().groupped(req.query.groupped);

      if (req.query.type) {
        provider.loadByType(req.query.type, (all) => {
          this._resp().success(res, all);
        });
      } else {
        provider.findBySku(req.query.sku, async (data) => {
          this._resp().success(res, data);
        });
      }
    }).apiRead();

    this.get('/fixes-dialog', (req, res) => {
      new DiagnosticsProvider().groupped(true).loadBySku(req.query.sku, (all, product) => {
        res.render('product/diagnostics/diagnostics-dialog', { data: all, product: product });
      });
    });

    this.post('/remove', (req, res) => {
      new ProductDiagnostics().remove(req.body.sku);
      res.status(200).send('Ok');
    });
  }
};
