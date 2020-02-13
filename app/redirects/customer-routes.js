const Routes = require('../redirects/controller/routes.js');
const CustomerProvider = require('../provider/customer-provider.js');


module.exports = class CustomerRoutes extends Routes{

  attach(){

    this._page('/customer-service/client', (req, res) => {
      if (req.query.id){
        CustomerProvider.get(req.query.id, (data) => {
          res.render('customer/client', {client: data});
        });
      }else{
        res.render('customer/client', {client: {}});
      }
    });


    this._get('/curtomer-search-autocomplete', (req, res) => {
      CustomerProvider.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

  }

};
