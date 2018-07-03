const EccosysCalls = require('../eccosys/eccosys-calls.js');
const UsersProvider = require('../provider/UsersProvider.js');
const Day = require('../bean/day.js');
const PendingEmailSender = require('../email/sender/pending-email-sender.js');

module.exports = {

  sendPendingEmail(pending){
    var sale = pending.sale;

     EccosysCalls.getClient(sale.idContato, (data)=>{
        var client = JSON.parse(data);
        console.log(client);
        var pendingEmailSender = new PendingEmailSender();
        pendingEmailSender.client(client.nome, client.email);
        pendingEmailSender.sale(sale);
        pendingEmailSender.send();
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
