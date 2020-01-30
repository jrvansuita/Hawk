const Routes = require('../redirects/controller/routes.js');
const SkuPictureLoader = require('../pictures/sku-picture-loader.js');
const SkuPic = require('../bean/sku-pic.js');

var cacheSkuPictures = {};

module.exports = class PicturesRoutes extends Routes{

  attach(){

    //Tela de imagens dos clientes...
    this._get('/sku-pictures', (req, res) => {
      res.render('product/pictures/sku-pictures');
    });

    //Post para criação de imagem do instagram
    this._post('/sku-picture-from-insta', (req, res) => {
      new SkuPictureLoader(req.body.skus).fromInsta(req.body.instaPost).load().then(this._resp().redirect(res));
    });


    //Post para excluir uma imagem
    this._post('/sku-picture-delete', (req, res) => {
      this._resp().sucess(req);

      SkuPic.findOne({_id: req.body._id}, (err, item)=>{
        item.remove();
      });
    });

    //Post para Aprovar a Imagem
    this._post('/sku-pictures-approve', (req, res) => {
      SkuPic.approved(req.body._id, req.body.approved, this._resp().redirect(res));
    });



    //Post para Paginação das imagens para Aprovação.
    this._post('/get-sku-pictures-page-to-approve', (req, res) => {
      var page = parseInt(req.body.page) || 1;

      SkuPic.getToBeApprovedPage(page, (err, all) => {
        res.send(all);
      });
    });


    //Post para Paginação das imagens aprovadas
    this._post('/get-sku-pictures-page', (req, res) => {
      var page = parseInt(req.body.page) || 1;
      var sku = req.body.sku;
      var useCache = req.body.cache;

      if (useCache){
        var cached = cacheSkuPictures[sku + page];

        if (cached){
          res.send(cached);
        }else{
          SkuPic.getSkuPageFlex(page, sku, (all)=>{
            cacheSkuPictures[sku + page] = all;
            res.send(all);
          });
        }
      }else{

        SkuPic.getSkuPage(page, sku, (all)=>{
          res.send(all);
        });
      }
    }, true, true);



  }
};
