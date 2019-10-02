const Routes = require('../redirects/controller/routes.js');
const MockHandler = require('../handler/mock-handler.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductMockupBuilder = require('../builder/product-mockup-builder.js');
const Mock = require('../bean/mock.js');

module.exports = class UserRoutes extends Routes{

  attach(){


    this._get('/mockup-builder', (req, res) => {
      Mock.get((err, mock)=>{
        res.render('product/mockup-builder.ejs', {selected: mock});
      });
    });

    this._post('/mockup-builder', (req, res) => {
      MockHandler.storeFromScreen(req.body, (mock)=>{
        res.status(200).send(mock);
      });
    });


    this._page('/product-mockup', (req, res) => {
      ProductHandler.getImage(req.query.sku, (product)=>{
        new ProductMockupBuilder()
        .setProduct(product)
        .setOnFinishedListener((canva)=>{
          var disposition = req.query.download ? 'attachment': 'inline';

          res.setHeader('Content-Type', 'image/png;');

          res.setHeader('Content-Disposition', disposition + '; filename=mockup-' + req.query.sku + '.png');

          canva.pngStream().pipe(res);
        })
        .load();
      });
    });



  }

};
