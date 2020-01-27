const Routes = require('../redirects/controller/routes.js');
const ImageSaver = require('../image/image-saver.js');

module.exports = class ImagesRoutes extends Routes{

  attach(){


    this._post('/upload-base64-img', (req, res) => {
      new ImageSaver()
      .setBase64Image(req.body.base64)
      .setOnSuccess((data) => {
        this._resp().sucess(res, data);
      })
      .setOnError((data) => {
        this._resp().error(res, 'Erro: ' + data.message);
      })
      .upload();
    });

    



  }

};
