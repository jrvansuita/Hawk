const Email = require('../email.js');
const PendingEmailTemplate = require('../templates/pending-email-template.js');


module.exports= class PendingEmailSender{

  constructor(){
    this.sender = new Email();
    this.defaultEmail = process.env.EMAIL;
    this.defaultReplyEmail = process.env.REPLY_EMAIL;
    this.defaultName = "Boutique Infantil";
    this.template = new PendingEmailTemplate();
  }

  sale(sale){
    this.sale = sale;
  }

  client(name, email){
    this.clientName = name;
    this.clientEmail = 'vansuita.jr@gmail.com'; //email;
  }

  send(callback){
    this.sender.to([this.clientEmail, this.defaultEmail]);
    //this.sender.to(["vansuita.jr@gmail.com", this.defaultReplyEmail]);
    this.sender.from(this.defaultName, this.defaultEmail);
    this.sender.replyTo(this.defaultReplyEmail, this.defaultReplyEmail);

    this.template.name(this.clientName);
    this.template.items(this.sale.items);

    this.sender.subject("[Requisição de Troca] - Pedido " + this.sale.numeroPedido + " - OC " + this.sale.numeroDaOrdemDeCompra);
    this.sender.html(this.template.build());
    this.sender.send(callback);
  }

};
