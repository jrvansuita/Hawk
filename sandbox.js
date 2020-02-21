



const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {



  const EmailBuilder = require('./app/email/email-builder.js');
  const Pending = require('./app/bean/pending.js');
  const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

  new EmailBuilder()
  .template('PENDING')
  .to('vansuita.jr@gmail.com')
  .send((err, sucessId) => {
    console.log(sucessId);
  });




});
