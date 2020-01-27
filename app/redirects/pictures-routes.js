const Routes = require('../redirects/controller/routes.js');
const SkuPictureLoader = require('../pictures/sku-picture-loader.js');
const SkuPic = require('../bean/sku-pic.js');

var cacheSkuPictures = {};

module.exports = class PicturesRoutes extends Routes{

  attach(){
    this._get('/sku-pictures', (req, res) => {
      res.render('product/pictures/sku-pictures');
    });

    this._get('/get-sku-pictures-page-approve', (req, res) => {
      var page = parseInt(req.query.page) || 1;

      SkuPic.getToBeApprovedPage(page, (err, doc) => {
        res.send(doc);
      });
    });



    this._post('/sku-picture-from-insta', (req, res) => {
      new SkuPictureLoader(req.body.skus).fromInsta(req.body.instaPost).load().then(this._resp().redirect(res));
    });

    this._post('/sku-pictures-approve', (req, res) => {
      SkuPic.approved(req.body._id, req.body.approved, this._resp().redirect(res));
    });

    this._get('/get-sku-pictures-page', (req, res) => {
      var page = parseInt(req.query.page) || 1;
      var sku = req.query.sku;

      var cached = cacheSkuPictures[sku + page];

      if (cached){
        res.send(cached);
      }else{
        SkuPic.getPage(page, sku, (all)=>{
          cacheSkuPictures[sku + page] = all;
          res.send(all);
        });
      }

    }, true, true);



  }




};
