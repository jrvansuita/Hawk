const EmailSender = require('../email/email-sender.js');
const TemplateBuilder = require('../template/template-builder.js');

module.exports = class EmailBuilder{

  constructor(){
    this.sender = new EmailSender();
    this.senderEmail = Params.email();
    this.senderName = Params.emailName();
  }

  template(type){
    this.templateType = type;
    return this;
  }

  to(email){
    this.to = email;
    return this;
  }

  receiveCopy(){
    this.wantMyCopy = true;
    return this;
  }

  copy(email){
    this.to = email;
    return this;
  }

  reply(email){
    this.replyEmail = email || Params.replayEmail();
    return this;
  }

  setData(data){
    this.data = data;
    return this;
  }

  prepare(){
    var destination = [this.to];
    if (this.wantMyCopy){
      destination.push(this.senderEmail);
    }

    this.sender.to(destination);
    this.sender.from(this.senderName, this.senderEmail);
    this.sender.replyTo(this.replyEmail, this.replyEmail);
  }

  loadTemplate(callback){
    new TemplateBuilder()
    .template(this.templateType)
    .setData(this.data)
    .build(callback);
  }


  send(callback){
    this.prepare();
    this.loadTemplate(() => {
      this.sender.subject(data.subject);
      this.sender.html(data.content);
      this.sender.send((err, id) => {
        if (callback){
          callback(err, id);
        }
      });
    });
  }
}
