const Routes = require('../redirects/controller/routes.js');
const SkuPictureLoader = require('../pictures/sku-picture-loader.js');
const SkuPic = require('../bean/sku-pic.js');


module.exports = class PicturesRoutes extends Routes{

  attach(){
    this._get('/sku-pictures', (req, res) => {
      res.render('product/pictures/sku-pictures');
    });


    this._post('/sku-picture-from-insta', (req, res) => {
      new SkuPictureLoader(req.body.sku).fromInsta(req.body.instaPost).load().then(() => {
        console.log('veio');
      });
    });

    this._get('/teste', (req, res) => {
      res.render('teste');
    });


    this._get('/sku-pictures-page', (req, res) => {

      var page = parseInt(req.query.page) || 1;
      var sku = req.query.sku;

      SkuPic.getPage(page, sku, (all)=>{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(all);
      });
    });



  }




};
