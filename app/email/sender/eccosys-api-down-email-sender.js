const Email = require('../email.js');
const Template = require('../templates/eccosys-api-down-email-template.js');

module.exports= class {

  constructor(){
    this.sender = new Email();
    this.defaultEmail = Params.email();
    this.defaultName = "Boutique Infantil";
    this.template = new Template();
  }

  response(error){
    this.template.response(error);
    return this;
  }

  request(options){
    this.template.request(options);
    return this;
  }

  send(callback){
    this.sender.to(Params.eccosysApiReportEmails());
    this.sender.from(this.defaultName, this.defaultEmail);
    this.sender.subject("[Down] - API do Eccosys parou de responder corretamente!");
    this.sender.html(this.template.build());
    this.sender.send(callback);
  }

};
