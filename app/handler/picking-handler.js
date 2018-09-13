const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PendingLaws = require('../laws/pending-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const UsersProvider = require('../provider/UsersProvider.js');
const PickingLaps = require('../handler/laps/picking-laps.js');
const TransportLaws = require('../laws/transport-laws.js');
const BlockedLaws = require('../laws/blocked-laws.js');


module.exports = {

  init(selected, onFinished) {
    TransportLaws.select(selected);

    if (PickingLaws.isEmpty()) {

      PendingLaws.load(true, ()=>{
        BlockedLaws.load(()=>{
          this.load(onFinished);
        });
      });
    } else {
      onFinished();
    }
  },

  load(callback){
    EccosysCalls.getPickingSales((data) => {
      try{
        PickingLaws.set(JSON.parse(data));
        this.setOffSales();
        PickingLaws.handleDevMode();

        if (!PickingLaws.isEmpty()){
          PickingLaps.loadSaleItems(PickingLaws.getList(), 0, callback);
        }else{
          callback();
        }
      }catch(e){
        console.log(e);
        callback();
      }
    });
  },

  handle(userId, callback) {
    if (UsersProvider.checkUserExists(userId)){
      //Convert from access or id
      userId = UsersProvider.get(userId).id;
      if (InprogressLaws.checkUserInProgress(userId)) {
        //In progress picking
        this.end(userId, callback);
      } else {
        this.next(userId, callback);
      }
    }
  },

  next(userId, callback) {
    var sale = PickingLaws.next(userId);
    InprogressLaws.startPicking(sale, userId);
    callback(PickingLaws.printUrl(sale));
  },

  end(userId, callback) {
    InprogressLaws.endPicking(userId, (sale)=>{
      DoneLaws.put(sale);
      callback("end-picking-" + sale.numeroPedido);
    });
  },


  setOffSales(){
    PickingLaws.assert(PendingLaws.getSaleNumbers());

    DoneLaws.handle(PickingLaws.getList());
    PickingLaws.assert(DoneLaws.getSaleNumbers());

    DoneLaws.assert(InprogressLaws.getSaleNumbers());
  },

  restart(user, doneSale, callback){
    var sale = DoneLaws.get(doneSale);

    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {

      PickingLaps.callLoadSaleItems(sale, function(){
        InprogressLaws.startPicking(sale, user.id, true);
        DoneLaws.remove(doneSale);
        callback();
      });
    }
  },

  getPickingSales(){
    return PickingLaws.getList();
  },



};
