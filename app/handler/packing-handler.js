const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockLaws = require('../laws/block-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const Err = require('../error/error.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const PackagesHandler = require('../handler/packages-handler.js');

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


  loadSale(sale, callback){
    var loader = new SaleLoader(sale)
    .loadClient()
    .loadItems()
    .loadItemsWeight()
    .run((loadedSale)=>{
      callback(loadedSale);
    });
  },

  loadDanfe(res, nfNumber){
    EccosysCalls.loadDanfe(res, nfNumber);
  },

  loadTransportTag(res, idNfe){
    EccosysCalls.loadTransportTag(res, idNfe);
  },

  done(params, callback){
    PackagesHandler.decPackStock(params.packageId);

    var body = {
      pickingRealizado : 'S',
      numeroPedido: params.saleNumber,
      pesoLiquido: params.liqWeigth,
      pesoBruto: params.bruWeigth,

      qtdVolumes: params.vols,
      especieVolume: params.esp,

      dimensaoAltura: params.height,
      dimensaoLargura: params.width,
      dimensaoComprimento: params.length,
    };

    EccosysCalls.updateSale([body], (updateResult)=>{
      console.log('--Update--');
      console.log(updateResult);
      if (JSON.parse(updateResult).result.success.length > 0){
        EccosysCalls.packingPostNF(params.saleNumber, (nfResult)=>{
          console.log('--NF--');
          console.log(nfResult);

          if (callback){
            callback(JSON.parse(nfResult));
          }
        });
      }else{
        if (callback){
          callback(JSON.parse(updateResult));
        }
      }
    });

  }
};
