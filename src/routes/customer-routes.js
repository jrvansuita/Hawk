const Routes = require('./_route.js');
const CustomerProvider = require('../provider/customer-provider.js');
const CustomerSendEmailHandler = require('../customer/customer-send-email-handler.js');
const SaleCustomerHandler = require('../customer/sale-customer-handler.js');
const Enum = require('../bean/enumerator.js');

module.exports = class CustomerRoutes extends Routes {
  mainPath() {
    return '/customer-service';
  }

  attach() {
    this.page('/client', (req, res) => {
      var redirect = async (data) => {
        res.render('customer/client', { client: data, saleStatus: await Enum.on('SALE-STATUS').get(true) });
      };

      if (req.query.id) {
        CustomerProvider.load(req.query.id, redirect);
      } else if (req.query.sale) {
        CustomerProvider.findBySale(req.query.sale, redirect);
      } else {
        redirect({});
      }
    });

    this.get('/sale-dialog', async (req, res) => {
      res.render('customer/sale', { saleNumber: req.query.saleNumber, paymentTypes: await Enum.on('PAY-TYPES').get(true) });
    });

    this.get('/sale', (req, res) => {
      CustomerProvider.loadSale(req.query.saleNumber, this._resp().redirect(res));
    });

    this.get('/autocomplete', (req, res) => {
      CustomerProvider.searchAutoComplete(req.query.typing, this._resp().redirect(res));
    });

    // enviar boleto
    this.post('/email-boleto', (req, res) => {
      new CustomerSendEmailHandler(req.body.userid).sendEmailBoleto(req.body, this._resp().redirect(res));
    });

    // envia rastreio
    this.post('/email-tracking', (req, res, locals) => {
      new CustomerSendEmailHandler(req.body.userid).sendEmailTracking(req.body, this._resp().redirect(res));
    });

    // envia nf
    this.post('/email-danfe', (req, res, locals) => {
      new CustomerSendEmailHandler(req.body.userid).sendEmailDanfe(req.body, this._resp().redirect(res));
    });

    // alterar status de pedidos
    this.post('/sale-status-change', (req, res) => {
      new SaleCustomerHandler().updateSaleStatus(req.body, this._resp().redirect(res));
    });
  }
};
