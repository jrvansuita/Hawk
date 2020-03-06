const EmailBuilder = require('../email/email-builder.js');

module.exports = {

  sendEmailBoleto(body, callback){

    data = [{
      attach: {
        filename : 'boleto.pdf',
        path: body.linkBoleto.split('html').join('pdf')
      },
      emailData: {
        cliente: body.cliente,
        oc: body.oc,
        boleto: body.linkBoleto
      }
    }];

    this._buildAndSendEmail('BOLETO', data);
  },

  sendEmailDanfe(body, callback){

    data = [{
      attach: {
        filename : 'danfe.pdf',
        path: Params.productionUrl() + '/packing-danfe?nfe=' + body.nfNumber
      },
      emailData: {
        cliente: body.cliente,
        oc: body.oc,
        nfNumber: body.nfNumber
      }
    }];

    this._buildAndSendEmail('NF', data);
  },

  _buildAndSendEmail(template, body){
    new EmailBuilder()
    .template(template)
    .to(body[0].emailData.cliente.email)
    .receiveCopy()
    .reply(Params.replayEmail())
    .setAttachments(body[0].attach)
    .setData(body[0].emailData)
    .send();
  }

};
