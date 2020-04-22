const Routes = require('../redirects/controller/routes.js');
const CustomerProvider = require('../provider/customer-provider.js');
const CustomerSendEmailHandler = require('../customer/customer-send-email-handler.js');

const SaleCustomerHandler = require('../customer/sale-customer-handler.js');


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

    //enviar boleto
    this._post('/customer-email-boleto', (req, res) => {
      new CustomerSendEmailHandler(req.body.userid)
      .sendEmailBoleto(req.body, this._resp().redirect(res));
    });

    //envia rastreio
    this._post('/customer-email-tracking', (req, res, locals) => {
      new CustomerSendEmailHandler(req.body.userid)
      .sendEmailTracking(req.body, this._resp().redirect(res));
    });

    //envia nf
    this._post('/customer-email-danfe', (req, res, locals) => {
      new CustomerSendEmailHandler(req.body.userid)
      .sendEmailDanfe(req.body, this._resp().redirect(res));
    });



    //alterar status de pedidos
    this._post('/customer-sale-status-change', (req, res) => {
      new SaleCustomerHandler().updateSaleStatus(req.body, this._resp().redirect(res));
    });

  };
};
