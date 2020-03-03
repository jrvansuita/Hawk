const Routes = require('../redirects/controller/routes.js');
const CustomerProvider = require('../provider/customer-provider.js');
const EmailBuilder = require('../email/email-builder.js');

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
    this._post('/customer-sending-boleto', (req, res) => {
      console.log(req.body);
      new EmailBuilder()
      .template('BOLETO')
      .to(req.body.cliente.email)
      .receiveCopy()
      .reply(Params.replayEmail())
      .setAttachments({
        filename: 'boleto.pdf',
        path: req.body.boleto
      })
      .setData({
        cliente: req.body.cliente,
        oc: req.body.oc,
        boleto: req.body.boleto
      }).send();
    });

    this._post('/customer-sending-tracking', (req, res) => {
      console.log(req.body);
      new EmailBuilder()
      .template('TRACKING')
      .to(req.body.cliente.email)
      .receiveCopy()
      .reply(Params.replayEmail())
      .setData({
        cliente: req.body.cliente,
        oc: req.body.oc,
        tracking: req.body.tracking
      }).send();
    });

    this._post('/customer-sending-nf', (req, res) => {
      console.log(req.body);
      new EmailBuilder()
      .template('NF')
      .to(req.body.cliente.email)
      .receiveCopy()
      .reply(Params.replayEmail())
      .setData({
        cliente: req.body.cliente,
        oc: req.body.oc,
        tracking: req.body.tracking
      }).send();
    });

  }

};
