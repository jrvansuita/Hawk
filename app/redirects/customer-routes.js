const Routes = require('../redirects/controller/routes.js');
const CustomerProvider = require('../provider/customer-provider.js');


module.exports = class CustomerRoutes extends Routes{

  attach(){

    this._page('/customer-service/client', (req, res) => {
      var redirect = (data) => {
        res.render('customer/client', {client: data});
      };

      if (req.query.id){
        CustomerProvider.load(req.query.id, redirect);
      }else if (req.query.sale){
        CustomerProvider.findBySale(req.query.sale, redirect);
      }else{
        redirect({});
      }
    });

    this._get('/customer-service/sale-dialog', (req, res) => {
      res.render('customer/sale', {saleNumber: req.query.saleNumber});
    });


    this._get('/customer-service/sale', (req, res) => {
      CustomerProvider.loadSale(req.query.saleNumber, this._resp().redirect(res));
    });

    this._get('/customer-search-autocomplete', (req, res) => {
      CustomerProvider.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

  }

};
