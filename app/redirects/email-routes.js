const Routes = require('../redirects/controller/routes.js');
const TemplateVault = require('../email/template/template-vault.js');
const Templates = require('../bean/template.js');
const TemplatesTypes = require('../email/template/templates-types.js');
const ImageSaver = require('../image/image-saver.js');





module.exports = class EmailRoutes extends Routes{

  attach(){

    this._page('/email-templates', (req, res) => {
      Templates.findAll((err, all)=>{
        var selected = all.find((e) => {
          return e._id == req.query._id;
        });

        res.render('email/email-templates', {selected: selected || {}, all: all, types: TemplatesTypes});
      });
    });


    this._post('/email-template', (req, res) =>{
      TemplateVault.storeFromScreen(req.body, (id)=>{
        res.status(200).send(id);
      });
    });


    this._post('/email-template-delete', (req, res) =>{
      Templates.delete(req.body._id, ()=>{
        res.sendStatus(200);
      });
    });


    this._post('/email-template-img-uploader', (req, res) =>{
      new ImageSaver()
      .setBase64Image(req.files.file.data.toString('base64'))
      .setOnSuccess((data) => {
        this._resp().sucess(res, {link: data.link});
      })
      .setOnError((data) => {
        this._resp().error(res, data.message);
      })
      .upload();
    });

  }

};
