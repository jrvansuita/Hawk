const PendingLaws = require('../laws/pending-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const PickingLaps = require('../handler/laps/picking-laps.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports = {


  load(clear, callback){
    PendingLaws.load(clear, callback);
  },

  store(sale, local, callback){
    PendingLaws.store(sale, local, ()=>{
      PickingLaws.remove(sale);
      InprogressLaws.remove(sale.numeroPedido);

      callback();
    });
  },

  incStatus(pending, callback){
    sendEmailIfNeed(pending, ()=>{
      PendingLaws.incrementStatus(pending, callback);
    });
  },

  restart(pending, loggerdUser, callback){
    var user = loggerdUser;

    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {
      PendingLaws.remove(pending.number);

      PickingLaps.callLoadSaleItems(pending.sale, function(sale, items){
        InprogressLaws.startPicking(sale, user.id, true);
        callback();
      });
    }
  }

};




function sendEmailIfNeed(pending, callback){
  if (pending.status == 0 && pending.sendEmail.toString() == "true"){
    var sale = pending.sale;

    EccosysCalls.getClient(sale.idContato, (data)=>{
      var client = JSON.parse(data)[0];
      var pendingEmailSender = new PendingEmailSender();
      pendingEmailSender.client(client.nome, client.email);
      pendingEmailSender.sale(sale);
      pendingEmailSender.send(callback);
    });
  }else{
    callback();
  }
}
