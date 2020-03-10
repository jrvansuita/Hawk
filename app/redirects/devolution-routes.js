const Routes = require('../redirects/controller/routes.js');
const TemplateBuilder = require('../template/template-builder.js');

module.exports = class CustomerRoutes extends Routes{

  attach(){

    this._get('/devolution/wellcome', (req, res) => {
      new TemplateBuilder().template('TF_WELLCOME').build((template) => {
          res.render('devolution/wellcome', {wellcomeTemplate:  template.content});

      });


    }, true, true);


  }
};
