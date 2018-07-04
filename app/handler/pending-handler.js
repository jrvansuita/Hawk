const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const PendingEmailSender = require('../email/sender/pending-email-sender.js');

module.exports = {

  sendEmail(pending, callback){
    var sale = pending.sale;

     EccosysCalls.getClient(sale.idContato, (data)=>{
        var client = JSON.parse(data)[0];
        var pendingEmailSender = new PendingEmailSender();
        pendingEmailSender.client(client.nome, client.email);
        pendingEmailSender.sale(sale);
        pendingEmailSender.send(callback);
     });
  }

   /*downloadLetter(saleNumber){
      EccosysCalls.getSale(saleNumber, (data)=>{
         var sale = JSON.parse(data);
         Pending.findOne(Pending.getKeyQuery(saleNumber),(err, pendingSale)=>{
           console.log(pendingSale);
           //console.log(sale);
         });
      });
   }*/
};
