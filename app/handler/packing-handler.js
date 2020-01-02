const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockLaws = require('../laws/block-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const Err = require('../error/error.js');
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const PackageTypeVault = require('../vault/package-type-vault.js');
const Day = require('../bean/day.js');
const HistoryStorer = require('../history/history-storer.js');

module.exports = {

  findSaleFromEan(ean, callback){

    var sale = DoneLaws.getList().find((each) => {
      return each.items && each.items.some((item) => {
        return item.gtin == ean;
      })
    });

    if(sale){
      this.loadSale(sale, callback);
    }else{
      callback({});
    }
  },


  findSale(saleNumber, userId,  callback){
    if (this._checkSaleNumber(saleNumber, callback)){

      var throwa = this._checkOtherLists(saleNumber, userId);

      if (throwa && throwa.error){
        callback(throwa);
      }else{
        var fromDone = DoneLaws.get(saleNumber);

        if (fromDone && fromDone.packingReady){
          callback(fromDone);
        }else{
          this.loadSale(saleNumber, callback);
        }
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
    var onError = () => {
      var saleNumber = typeof sale == 'string'? sale : sale.numeroPedido;
      callback({error : Const.sale_not_found.format(saleNumber), numeroPedido: saleNumber});
    }

    new SaleLoader(sale)
    .loadClient()
    .loadItems()
    .loadNfe()
    .loadItemsDeepAttrs()
    .setOnError(onError)
    .run((loadedSale)=>{
      if (!loadedSale){
        onError();
      }else{
        callback(loadedSale);
      }
    });
  },

  loadDanfe(res, nfNumber){
    new EccosysProvider().danfe(res, nfNumber);
  },

  loadTransportTag(res, idNfe){
    new EccosysProvider().transportTag(res, idNfe);
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
    new EccosysStorer().sale().update(this.getSalePackingBody(params)).go((data)=>{
      callback(data.result.success.length > 0, data.result);
    });
  },

  sendNfe(user, params, callback){
    if (Num.def(params.idNfe) > 0){
      //A nota já está criada e estamos reenviando ela.
      new EccosysStorer().retryNfe(user, params.idNfe).go(nfResult=>{
        callback(nfResult);
      });
    }else{
      //Está enviando a nota pela primeira vez
      new EccosysStorer().nfe(user, params.saleNumber).go(nfResult=>{
        callback(nfResult);
      });
    }
  },


  done(params, user, callback){
    this.updateSale(params, (sucess, updateResult)=>{

      if (sucess){
        this.sendNfe(user, params, (nfResult)=>{
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

  countPoints(params.saleNumber, user, (day, sale)=>{
    HistoryStorer.packingRejected(user.id, params.saleNumber, params.oc, error);
  });

  DoneLaws.remove(params.saleNumber);
}

function onPackingDone(params, user){
  DoneLaws.remove(params.saleNumber);
  PackageTypeVault.decPackStock(params.packageId);

  countPoints(params.saleNumber, user, (day, sale)=>{
    HistoryStorer.packing(user.id, sale, day);
  });

  prepareDoneList();
}

function countPoints(saleNumber, user, callback){
  new SaleLoader(saleNumber)
  .loadClient()
  .loadItems()
  .run((sale)=>{
    if (sale){
      var day = Day.packing(user.id, Dat.today(), sale);

      Day.sync(day, (err, doc) => {
        callback(day, sale);
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
