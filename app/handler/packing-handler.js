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

      var sale = this._findSaleFromGood(saleNumber);

      if (!sale){
        sale = this._checkOtherLists(saleNumber, userId);
      }

      if (sale && sale.error){
        callback(sale);
      }else{
        this.loadSale(sale || saleNumber, callback);
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

  _findSaleFromGood(saleNumber){
    return DoneLaws.get(saleNumber) || PickingLaws.get(saleNumber);
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

  /*done(params, callback){
    if (params.saleNumber == '252454'){
      callback({"success":[],"error":[{"id":"251477","erro":"No foi possivel validar a nota fiscal. Detalhes: 1 - Preencha o campo Nome do Contato.; 2 - Preencha o campo Ender do Contato.; 3 - Preencha o campo Namero do endere do Contato.; 4 - Preencha o campo Bairro do Contato.; 5 - Preencha o campo CEP do Contato.; 6 - Preencha o campo Muniio do Contato.; 7 - Preencha o campo UF do Contato.; 8 - Preencha o campo CPFCNPJ no cadastro do contato.; 9 - Problema com o item<b>Conjunto Beba Love Kitty Branco - Meu Pedacinho-G<b>: CFOP e a situa tribut"}]});
    }
  },*/

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
