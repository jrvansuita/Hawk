const Routes = require('../redirects/controller/routes.js');
const TemplateVault = require('../template/template-vault.js');
const Templates = require('../bean/template.js');
const TemplatesTypes = require('../template/templates-types.js');
const TemplateBuilder = require('../template/template-builder.js');
const ImageSaver = require('../image/image-saver.js');

module.exports = class EmailRoutes extends Routes{

  attach(){

    this._page('/templates', (req, res) => {
      Templates.findAll((err, all)=>{
        var selected = all.find((e) => {
          return e._id == req.query._id;
        });

        res.render('templates/templates', {selected: selected || {}, all: all, types: TemplatesTypes});
      });
    });

    this._get('/templates-viewer', (req, res) => {
      new TemplateBuilder(req.query._id).useSampleData().build((template) => {

        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Length': template.content.length,
        });
        res.end(template.content);
      });
  });


  this._post('/template', (req, res) =>{
    TemplateVault.storeFromScreen(req.body, (id)=>{
      res.status(200).send(id);
    });
  });


  this._post('/template-delete', (req, res) =>{
    Templates.delete(req.body._id, ()=>{
      res.sendStatus(200);
    });
  });


  this._post('/template-img-uploader', (req, res) =>{
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
