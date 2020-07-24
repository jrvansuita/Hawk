const Routes = require('./_route.js')
const TemplateVault = require('../template/template-vault.js')
const Templates = require('../bean/template.js')
const Enum = require('../bean/enumerator')
const TemplateBuilder = require('../template/template-builder.js')
const ImageSaver = require('../image/image-saver.js')

module.exports = class TemplateRoutes extends Routes {
  mainPath() {
    return '/templates'
  }

  attach() {
    var templateRedirect = async (req, res, all, type) => {
      var selected = all.find((e) => {
        return e.id === parseInt(req.query.id)
      })

      res.render('templates/templates', {
        selected: selected || {},
        all: all,
        usages: await Enum.on('TEMPL-EMAIL').get(true),
        templateType: type,
      })
    }

    this._page('/email', (req, res) => {
      Templates.getAllEmails((_err, all) => {
        templateRedirect(req, res, all, 'email')
      })
    })

    this._page('/block', (req, res) => {
      Templates.getAllBlocks((_err, all) => {
        templateRedirect(req, res, all, 'block')
      })
    })

    this._get('/viewer', (req, res) => {
      Templates.refresh(req.query.id)

      new TemplateBuilder(req.query.id).useSampleData().build((template) => {
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Length': template.content.length,
        })
        res.end(template.content)
      })
    })
      .skipLogin()
      .cors()

    this._post('', (req, res) => {
      TemplateVault.storeFromScreen(req.body, (id) => {
        res.status(200).send(id.toString())
      })
    })

    this._post('/delete', (req, res) => {
      Templates.delete(req.body.id, () => {
        res.sendStatus(200)
      })
    })

    this._post('/duplicate', (req, res) => {
      Templates.duplicate(req.body.id, (data) => {
        res.send(data)
      })
    })

    this._post('/img-uploader', (req, res) => {
      new ImageSaver()
        .setBase64Image(req.files.file.data.toString('base64'))
        .setOnSuccess((data) => {
          this._resp().sucess(res, { link: data.link })
        })
        .setOnError((data) => {
          this._resp().error(res, data.message)
        })
        .upload()
    })
  }
}
