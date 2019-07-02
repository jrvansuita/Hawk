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
    if (saleNumber == '0'){
      console.log('loadSale');
      console.log(new Error().stack);
    }


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
    new EccosysCalls().loadDanfe(res, nfNumber);
  },

  loadTransportTag(res, idNfe){
    new EccosysCalls().loadTransportTag(res, idNfe);
  },

  updateNCM(sku, newNCM, user, callback) {

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
    new EccosysCalls().updateSale(this.getSalePackingBody(params), (updateResult)=>{
      if (callback){
        var result = JSON.parse(updateResult).result;
        callback(result.success.length > 0, result);
      }
    });
  },

  sendNfe(user, params, callback){
    if (Num.def(params.idNfe) > 0){
      //A nota já está criada e estamos reenviando ela.
      new EccosysCalls().resendRejectedNF(user, params.idNfe, (nfResult)=>{
        if (callback){
          callback(nfResult);
        }
      });
    }else{
      //Está enviando a nota pela primeira vez
      new EccosysCalls().packingPostNF(user, params.saleNumber, (nfResult)=>{
        if (callback){
          callback(nfResult);
        }
      });
    }
  },


  done(params, user, callback){


    this.updateSale(params, (sucess, updateResult)=>{

      if (sucess){
        this.sendNfe(user, params, (nfResult)=>{
          nfResult = JSON.parse(nfResult);
          console.log(nfResult);
          //'Enviou o resultado via Broadcast'
          global.io.sockets.emit(params.saleNumber, nfResult);
          var sucess = !nfResult.error || !nfResult.error.length;

          if (sucess){
            onPackingDone(params, user);
          }else{
            onPackingRejected(params, user, nfResult);
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

function onPackingRejected(params, user, result){
  var error = result.error[0].erro.split('\n')[0];

  countPoints(params.saleNumber, (day)=>{
     HistoryStorer.packingRejected(user.id, params.saleNumber, params.oc, error);
  });

  DoneLaws.remove(params.saleNumber);
}

function onPackingDone(params, user){
  DoneLaws.remove(params.saleNumber);
  PackagesHandler.decPackStock(params.packageId);

  countPoints(params.saleNumber, (day)=>{
    HistoryStorer.packing(user.id, sale, day);
  });

  prepareDoneList();
}

function countPoints(saleNumber, callback){
  new SaleLoader(saleNumber)
  .loadClient()
  .loadItems()
  .run((sale)=>{
    if (sale){
      var day = Day.packing(user.id, Dat.today(), sale);

      Day.sync(day, (err, doc) => {
        callback(day);
      });
    }
  });
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
