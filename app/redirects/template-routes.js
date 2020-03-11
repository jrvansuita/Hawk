const Routes = require('../redirects/controller/routes.js');
const TemplateVault = require('../template/template-vault.js');
const Templates = require('../bean/template.js');
const TemplatesUsages = require('../template/templates-usages.js');
const TemplateBuilder = require('../template/template-builder.js');
const ImageSaver = require('../image/image-saver.js');

module.exports = class EmailRoutes extends Routes{

  attach(){

   var templateRedirect = (req, res, all)=>{
     var selected = all.find((e) => {
       return e.id == req.query.id;
     });

     res.render('templates/templates', {selected: selected || {}, all: all, usages: TemplatesUsages});
   };

    this._page('/email-templates', (req, res) => {
      Templates.getAllEmails((err, all)=>{
         templateRedirect(req, res, all);
      });
    });

    this._page('/block-templates', (req, res) => {
      Templates.getAllBlocks((err, all)=>{
        templateRedirect(req, res, all);
      });
    });

    this._get('/templates-viewer', (req, res) => {
      new TemplateBuilder(req.query.id).useSampleData().build((template) => {

        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Length': template.content.length,
        });
        res.end(template.content);
      });
  }, true, true); 


  this._post('/template', (req, res) =>{
    TemplateVault.storeFromScreen(req.body, (id)=>{
      res.status(200).send(id.toString());
    });
  });


  this._post('/template-delete', (req, res) =>{
    Templates.delete(req.body.id, ()=>{
      res.sendStatus(200);
    });
  });

  this._post('/template-duplicate', (req, res) =>{
    Templates.duplicate(req.body.id, (data)=>{
      res.send(data);
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
