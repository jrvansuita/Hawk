const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockLaws = require('../laws/block-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const Err = require('../error/error.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PackagesHandler = require('../handler/packages-handler.js');
const Day = require('../bean/day.js');
const HistoryStorer = require('../history/history-storer.js');

module.exports = {

  findSale(saleNumber, userId,  callback){
    if (this._checkSaleNumber(saleNumber, callback)){

      var throwa = this._checkOtherLists(saleNumber, userId);

      if (throwa && throwa.error){
        callback(throwa);
      }else{
        this.loadSale(saleNumber, callback);
      }
    }
  },

  _checkSaleNumber(saleNumber, callback){
    if (!saleNumber){
      callback({});
      return false;
    }else{
      return true;
    }
  },

  _checkOtherLists(saleNumber, userId){
    try{
      if (InprogressLaws.get(saleNumber)){
        Err.thrw(Const.sale_in_progress, userId);
      }

      if (PendingLaws.find(saleNumber)){
        Err.thrw(Const.sale_in_pending, userId);
      }
    }catch(e){
      return {error: e.toString(), numeroPedido: saleNumber} ;
    }
  },

  loadSale(saleNumber, callback){
    var fromDone = DoneLaws.get(saleNumber);

    if (fromDone && fromDone.packingReady){
      callback(fromDone);
    }else{
      new SaleLoader(saleNumber)
      .loadClient()
      .loadItems()
      .loadNfe()
      .loadItemsDeepAttrs()
      .run((loadedSale)=>{
        if (!loadedSale){
          loadedSale = {error : Const.sale_not_found.format(saleNumber), numeroPedido: saleNumber};
        }

        callback(loadedSale);
      });
    }
  },

  loadDanfe(res, nfNumber){
    EccosysCalls.loadDanfe(res, nfNumber);
  },

  loadTransportTag(res, idNfe){
    EccosysCalls.loadTransportTag(res, idNfe);
  },

  getSalePackingBody(params){
    return [{
      pickingRealizado : 'S',
      numeroPedido: params.saleNumber,
      pesoLiquido: params.liqWeigth,
      pesoBruto: params.bruWeigth,

      qtdVolumes: params.vols,
      especieVolume: params.esp,

      dimensaoAltura: params.height,
      dimensaoLargura: params.width,
      dimensaoComprimento: params.length,
    }];
  },

  updateSale(params, callback){
    EccosysCalls.updateSale(this.getSalePackingBody(params), (updateResult)=>{
      if (callback){
        var result = JSON.parse(updateResult).result;
        callback(result.success.length > 0, result);
      }
    });
  },

  sendNfe(user, saleNumber, callback){
    EccosysCalls.packingPostNF(saleNumber, user, (nfResult)=>{
      if (callback){
        callback(nfResult);
      }
    });
  },


  done(params, user, callback){
    PackagesHandler.decPackStock(params.packageId);

    this.updateSale(params, (sucess, updateResult)=>{

      if (sucess){
        this.sendNfe(params.saleNumber, user, (nfResult)=>{
          nfResult =  JSON.parse(nfResult);
          console.log(nfResult);
          //'Enviou o resultado via Broadcast'
          global.io.sockets.emit(params.saleNumber, nfResult);
          if (nfResult.success.length > 0){
            onPackingDone(params, user);
          }
        });
      }

      if (callback){
        //Envia uma notificação com OK do envio da NF-e ou a critica de update de pedido
        callback(sucess ? {code:200} : updateResult);
      }
    });
  }
};

function onPackingDone(params, user, callback){
  DoneLaws.remove(params.saleNumber);

  new SaleLoader(params.saleNumber)
  .loadClient()
  .loadItems()
  .run((sale)=>{
    if (sale){
      var day = Day.packing(user.id, Dat.today, sale);

      HistoryStorer.packing(user.id, sale, day);

      Day.sync(day, (err, doc) => {
        //nothing
      });
    }
  });

  prepareDoneList();
}



function prepareDoneList(){
  var doneList = DoneLaws.getList();

  for(var i=0; i< doneList.length;i++){
    var doneSale = doneList[i];

    if (!doneSale.packingReady){
      var loader = new SaleLoader(doneSale)
      .loadClient()
      .reloadItems()
      .loadItemsDeepAttrs()
      .run((loadedSale)=>{
        loadedSale.packingReady = true;
        loadedSale.pickingRealizado = "A";
        DoneLaws.put(loadedSale);
      });
    }
  }
}
