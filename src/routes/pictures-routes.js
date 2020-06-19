const Routes = require('./_route.js')
const SkuPictureLoader = require('../pictures/sku-picture-loader.js')
const SkuPic = require('../bean/sku-pic.js')
const ClientShareHandler = require('../pictures/client-share-handler.js')

module.exports = class PicturesRoutes extends Routes {
  attach () {
    // Tela de imagens dos clientes...
    this._get('/sku-pictures', (req, res) => {
      SkuPic.countAll({}, (_err, data) => {
        res.render('product/pictures/sku-pictures', { data: data[0].info })
      })
    })

    // Post para criação de imagem do instagram
    this._post('/sku-picture-from-insta', (req, res) => {
      // fazer aqui a verificaçao

      new SkuPictureLoader(req.body.skus).fromInsta(req.body.instaPost).load().then(this._resp().redirect(res))
    })

    // Post externo para fazer o upload via store front
    this._post('/share-picture-data', (req, res) => {
      new ClientShareHandler(req.body.sku).setBase64Image(req.body.base64).load((doc) => {
        this._resp().sucess(res, doc)
      })
    }).skipLogin().cors()

    // Post para excluir uma imagem
    this._post('/sku-picture-delete', (req, res) => {
      this._resp().sucess(res)

      SkuPic.findOne({ _id: req.body._id }, (_err, item) => {
        item.remove()
      })
    })
    // post para verificar a imagem
    this._post('/check-if-picture-exists', (req, res) => {
      SkuPic.findOne({ url: req.body.url }, (_err, item) => {
        this._resp().sucess(res, item)
      })
    })

    // Post para Aprovar a Imagem
    this._post('/sku-pictures-approve', (req, res) => {
      SkuPic.approved(req.body._id, req.body.approved, this._resp().redirect(res))
    })

    // Post para Paginação das imagens para Aprovação.
    this._post('/get-sku-pictures-page-to-approve', (req, res) => {
      var page = parseInt(req.body.page) || 1

      SkuPic.getToBeApprovedPage(page, (_err, all) => {
        res.send(all)
      })
    })

    // Post para Paginação das imagens aprovadas
    this._post('/get-sku-pictures-page', (req, res) => {
      var page = parseInt(req.body.page) || 1
      var sku = req.body.sku

      SkuPic.getSkuPage(page, sku, 30, (all) => {
        res.send(all)
      })
    })
  }
}
