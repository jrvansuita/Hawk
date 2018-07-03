const Email = require('../email.js');
const PendingEmailTemplate = require('../templates/pending-email-template.js');

module.exports= class PendingEmailSender{

  constructor(){
    this.sender = new Email();
    this.defaultEmail = "atendimento@boutiqueinfantil.com.br";
    this.defaultName = "Boutique Infantil";
    this.template = new PendingEmailTemplate();
  }

  sale(sale){
    this.sale = sale;
  }

  client(name, email){
    this.clientName = name;
    this.clientEmail = email;
  }

  send(){
    //this.sender.to([this.clientEmail, this.defaultEmail]);
    this.sender.to(["vansuita.jr@gmail.com", this.defaultEmail]);
    this.sender.from(this.defaultName, this.defaultEmail);
    this.sender.replyTo(this.defaultName, this.defaultEmail);

    this.template.name(this.clientName);
    this.template.items(sale.items);

    email.subject("[Requisição de Troca] - Pedido " + this.sale.numeroPedido);
    email.html(this.template.build());
    email.send();
  }

};
