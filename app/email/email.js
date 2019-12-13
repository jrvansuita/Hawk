const History = require('../bean/history.js');
const nodemailer = require('nodemailer');


module.exports = class Email{

  constructor(){
    this.mailOptions = {};

    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: Params.email(), // generated ethereal user
        pass: Params.emailPass() // generated ethereal password
      }
    });
  }

  from(name, email){
    this.mailOptions.from = name + " <" + email + ">";
  }

  to(emails){
    this.mailOptions.to = (emails instanceof Array) ? emails.join(',') : emails;
  }

  replyTo(name, email){
    this.mailOptions.replyTo = name + " <" + email + ">";
  }

  subject(subject){
    this.mailOptions.subject = subject;
  }

  body(text){
    this.mailOptions.text = text;
  }

  html(html){
    this.mailOptions.html = html;
  }

  send(callback){
    // send mail with defined transport object
    this.transporter.sendMail(this.mailOptions, (error, info) => {
      try{

        if (this.transporter){
          this.transporter.close()
        }

        if (error) {
          callback(error, null);
          console.log('Erro ao enviar email ' + error.toString());
          return error;
        }

        callback(null, info.messageId);
      }catch(e){
        History.error(e);
      }
    });
  }

};
