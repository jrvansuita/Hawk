const Routes = require('../redirects/controller/routes.js');
const MockVault = require('../mockup/mockup-vault.js');
const ProductHandler = require('../handler/product-handler.js');
const ProductMockupProvider = require('../mockup/product-mockup-provider.js');
const Mock = require('../bean/mock.js');


module.exports = class UserRoutes extends Routes{

  attach(){


    this._page('/mockup-builder', (req, res) => {
      Mock.get((err, mock)=>{
        res.render('product/mockup/mockup-builder.ejs', {selected: mock});
      });
    });

    this._post('/mockup-builder', (req, res) => {
      MockVault.storeFromScreen(req.body, (mock)=>{
        res.status(200).send(mock);
      });
    });


    this._get('/product-mockup', (req, res) => {

      new ProductMockupProvider(req.query.sku).load().then(canvas =>{
        var disposition = req.query.download ? 'attachment': 'inline';

        res.setHeader('Content-Type', 'image/png;');

        res.setHeader('Content-Disposition', disposition + '; filename=mockup-' + req.query.sku + '.png');

        canvas.pngStream().pipe(res);
      });
    });



  }

};
