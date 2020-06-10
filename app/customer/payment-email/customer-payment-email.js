const EmailBuilder = require('../../email/email-builder.js');
const SaleLoader = require('../../loader/sale-loader.js');

module.exports = class CustomerPaymentEmail{

  go(saleNumber, callback){
    new SaleLoader(saleNumber).loadClient().run((eccosysData) => {
      this._sendEmail(eccosysData, () => {

      })
    })
  }

  _sendEmail(data, callback){
    new EmailBuilder()
    .template('PAYMENT')
    .to(data.client.email)
    .setData({name: data.client.nome, oc: data.numeroDaOrdemDeCompra, method: data.paymentType})
    .send((res) => {});
  }

}
