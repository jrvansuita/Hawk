const Routes = require('../redirects/controller/routes.js');
const ImgurSaver = require('../imgur/save-image.js');

module.exports = class UserRoutes extends Routes{

  attach(){

    this._get('/john-travolta', (req, res) => {
      res.render('easter/john-travolta');
    });


    this._post('/upload-img', (req, res) => {
      //base64Image
      ImgurSaver.upload(req.body.img, (data)=>{
        if (data.link){
          this._resp().sucess(res, data);
        }else{
          this._resp().error(res, 'Erro: ' + data.message);
        }
      });
    });



  }

};