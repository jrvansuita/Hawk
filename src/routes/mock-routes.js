const Routes = require('./_route.js')
const MockVault = require('../mockup/mockup-vault.js')
const ProductMockupProvider = require('../mockup/product-mockup-provider.js')
const Mock = require('../bean/mock.js')
const fs = require('fs')

module.exports = class UserRoutes extends Routes {
  mainPath() {
    return '/mockup'
  }

  attach() {
    this._page('/builder', (req, res) => {
      Mock.findAll((_err, all) => {
        var selected = all.find((e) => {
          return e._id.toString() === req.query._id
        })

        res.render('product/mockup/mockup-builder.ejs', { selected: selected || all[0], all: all })
      })
    })

    this._post('/builder', (req, res) => {
      MockVault.storeFromScreen(req.body, (id) => {
        res.status(200).send(id)
      })
    })

    this._get('/get-all', (req, res) => {
      Mock.findAll((_err, all) => {
        res.status(200).send(all)
      })
    })

    this._get('/build-multiple', (req, res) => {
      req.query.skus = typeof req.query.skus === 'string' ? req.query.skus.split(',') : req.query.skus

      new ProductMockupProvider(req.query.skus)
        .with(req.query.mockId)
        .load()
        .then((zipFilePath) => {
          res.setHeader('Content-disposition', 'attachment; filename=mockups.zip')
          res.setHeader('Content-type', 'application/zip')

          var filestream = fs.createReadStream(zipFilePath)
          filestream.pipe(res)
        })
    })

    this._get('/product', (req, res) => {
      new ProductMockupProvider(req.query.sku)
        .with(req.query.mockId)
        .load()
        .then((canvas) => {
          var disposition = req.query.download ? 'attachment' : 'inline'
          res.setHeader('Content-Type', 'image/png;')
          res.setHeader('Content-Disposition', disposition + '; filename=mockup-' + req.query.sku + '.png')
          canvas.pngStream().pipe(res)
        })
    })
  }
}
