const Routes = require('./_route.js')
const ImageSaver = require('../image/image-saver.js')

module.exports = class ImagesRoutes extends Routes {
  mainPath() {
    return '/image'
  }

  attach() {
    this._post('/upload-base64', (req, res) => {
      new ImageSaver()
        .setBase64Image(req.body.base64)
        .setOnSuccess((data) => {
          this._resp().sucess(res, data)
        })
        .setOnError((data) => {
          this._resp().error(res, 'Erro: ' + data.message)
        })
        .upload()
    }).cors()
  }
}
