
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');

const PendingLaws = require('../laws/pending-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const UsersProvider = require('../provider/user-provider.js');
const BlockHandler = require('../handler/block-handler.js');
const SalesArrLoader = require('../loader/sales-arr-loader.js');
const SaleLoader = require('../loader/sale-loader.js');
const History = require('../bean/history.js');
const TransportLaws = require('../laws/transport-laws.js');
const UfLaws = require('../laws/uf-laws.js');
const AutoBlockPicking = require('../auto/auto-block-picking.js');

var loadingList = false;
var loadingId = 0;
var openSalesCount = 0;
var ignoreDone = false;

module.exports = {

  init(onFinished) {
    if (!loadingList && PickingLaws.isFullEmpty() && !BlockHandler.hasBlockSales()) {
      loadingList = true;

      PendingLaws.load(true, ()=>{
        BlockHandler.load(()=>{
          this.load(onFinished);
        });
      });
    } else {
      onFinished();
      loadOpenSales();
    }
  },

  reloadPickingList(userId, ignore, callback){
    if (!loadingList){
      ignoreDone = ignore;

      PickingLaws.clear(userId);
      this.init(callback);
    }else{
      callback();
    }
  },

  load(onFinished){
    new EccosysProvider().setOnError((error)=>{
      loadingList = false;
      onFinished();
      throw error;
    }).pickingSales().go((sales) => {
      try{

        loadingList = true;

        PickingLaws.set(sales);

        this.setOffSales();

        PickingLaws.handleDevMode();

        if (!PickingLaws.isFullEmpty()){

          new SalesArrLoader(PickingLaws.getFullList())
          .setOnError((error)=>{
            loadingList = false;
            throw error;
          })
          .loadClient((sale)=>{
            if (sale.client)
            UfLaws.put(sale.client.uf);
          })
          .loadItems(true)
          .onFilter((sale)=>{
            return !BlockHandler.checkAllBlocksAndCapture(sale);
          })
          .onEverySaleLoaded((sale)=>{
            attachRunningChecker();
            TransportLaws.put(sale.transport);
            new AutoBlockPicking([sale]).run();
          })
          .onLastSaleLoaded(()=>{
            loadingList = false;
          })
          .run(onFinished);

        }else{
          loadingList = false;
          onFinished();
        }
      }catch(e){
        loadingList = false;
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
    callback(sale);
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

    if (ignoreDone){
      DoneLaws.clear();
      ignoreDone = false;
    }else{
      //Load Done List from Picking List
      DoneLaws.handle(PickingLaws.getFullList());

      //Remove Done List from Picking List
      PickingLaws.assert(DoneLaws.getSaleNumbers());

      //Remove In Progress Sales From Done List
      DoneLaws.assert(InprogressLaws.getSaleNumbers());
    }
  },

  restart(userId, doneSale, callback){
    var sale = DoneLaws.get(doneSale);
    var user = UsersProvider.get(userId);

    if (!InprogressLaws.checkAndThrowUserInProgress(user.id)) {

      new SaleLoader(sale).reloadItems().run(function(sale){
        InprogressLaws.startPicking(sale, user.id, true);
        DoneLaws.remove(doneSale);
        callback();
      });
    }
  },

  getPickingSales(){
    return PickingLaws.getList();
  },

  getPickingSalesTotalCount(){
    return PickingLaws.getFullList().length;
  },

  getOpenSalesCount(){
    return openSalesCount;
  }

};


function attachRunningChecker(){
  clearTimeout(loadingId);
  loadingId = setTimeout(function(){
    loadingList = false;
  }, 10000);
}

var openSalesController = 0;

function loadOpenSales(){
  if (openSalesController < new Date().getTime()){
    //Add +30 min to now
    openSalesController = new Date().getTime() + 1.8e+6;
    new EccosysProvider().openSales().go((sales) => {
      openSalesCount = sales.length;
    });
  }
}
