const EmailBuilder = require('../email/email-builder.js');
const History = require('../bean/history.js');

module.exports = class CustomerHandler{

  constructor(userId){
    this.userId = userId;
  }

  sendEmailBoleto(body, callback){

    var data = [{
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

    this._buildAndSendEmail('BOLETO', data, callback);
  }

  sendEmailDanfe(body, callback){

    var data = [{
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

    this._buildAndSendEmail('NF', data, callback);
  }

  _buildAndSendEmail(template, body, callback){
    new EmailBuilder()
    .template(template)
    .to("jaison.com.br")//body[0].emailData.cliente.email)
    //.receiveCopy()
    //.reply(Params.replayEmail())
    .setAttachments(body[0].attach)
    .setData(body[0].emailData)
    .send((err, id) => {
      if(err){
        History.notify(this.userId, 'Erro ao enviar email', 'Ocorreu um erro ao tentar enviar o email referente ao pedido {0}'.format(body[0].emailData.oc), 'Email');
      }else{
        History.notify(this.userId, 'Email Enviado', Const.customer_email_sending.format(template.toLocaleLowerCase(), body[0].emailData.cliente.email, body[0].emailData.oc), 'Email');
      }
      callback(id);
    });
  }

};
