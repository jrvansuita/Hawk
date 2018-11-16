const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PendingLaws = require('../laws/pending-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const UsersProvider = require('../provider/UsersProvider.js');
const BlockedLaws = require('../laws/blocked-laws.js');
const SalesArrLoader = require('../loader/sales-arr-loader.js');
const SaleLoader = require('../loader/sale-loader.js');
const History = require('../bean/history.js');
const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const AutoBlockPicking = require('../auto/auto-block-picking.js');

module.exports = {

  init(onFinished) {
    if (PickingLaws.isFullEmpty() && !BlockedLaws.hasBlockSales()) {
      PendingLaws.load(true, ()=>{
        BlockedLaws.load(()=>{
          this.load(onFinished);
        });
      });
    } else {
        onFinished();
    }
  },

  load(onFinished){
    EccosysCalls.getPickingSales((sales) => {
      try{
        PickingLaws.set(sales);

        this.setOffSales();

        PickingLaws.handleDevMode();

        if (!PickingLaws.isFullEmpty()){

          new SalesArrLoader(PickingLaws.getFullList())
          .loadClient((sale)=>{
            UfLaws.put(sale.client.uf);
          })
          .loadItems(true)
          .onFilter((sale)=>{
            return !BlockedLaws.checkAllAndCapture(sale);
          })
          .onEverySaleLoaded((sale)=>{
            TransportLaws.put(sale.transport);
            new AutoBlockPicking([sale]).run();
          })
          .run(onFinished);

        }else{
          onFinished();
        }
      }catch(e){
        History.error(e);
        onFinished();
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
    //Remove Pendings from Picking List
    PickingLaws.assert(PendingLaws.getSaleNumbers());

    //Load Done List from Picking List
    DoneLaws.handle(PickingLaws.getFullList());

    //Remove Done List from Picking List
    PickingLaws.assert(DoneLaws.getSaleNumbers());

    //Remove In Progress Sales From Done List
    DoneLaws.assert(InprogressLaws.getSaleNumbers());
  },

  restart(user, doneSale, callback){
    var sale = DoneLaws.get(doneSale);

    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {

      new SaleLoader(sale).loadItems().run(function(sale){
        InprogressLaws.startPicking(sale, user.id, true);
        DoneLaws.remove(doneSale);
        callback();
      });
    }
  },

  getPickingSales(){
    return PickingLaws.getList();
  }




};
