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
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.EMAIL_PASS // generated ethereal password
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
        
        if (error) {
          callback(error, null);
          return console.log(error);
        }

        callback(null, info.messageId);
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        //      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      }catch(e){
        console.log(e);
        History.error(e);
      }
    });
  }

};
