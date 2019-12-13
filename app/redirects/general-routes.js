const Routes = require('../redirects/controller/routes.js');
const ImgurSaver = require('../imgur/save-image.js');

module.exports = class UserRoutes extends Routes{

  attach(){

    this._get('/john-travolta', (req, res) => {
      res.render('easter/john-travolta');
    });

    this._get('/teste', (req, res) => {
      res.render('teste');
    });

  /*  this._get('/param22', (req, res) =>{
      //res.send(require('../param/get.js'));
      //res.send({teste: true});
      //res.download(Params);
      this._resp().sucess(res, Params);
    });
*/

    this._get('/restart', (req, res) =>{
      process.exit(1);
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
