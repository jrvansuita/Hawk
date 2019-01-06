const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const SaleLoader = require('../loader/sale-loader.js');
const BlockLaws = require('../laws/block-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');
const Err = require('../error/error.js');

module.exports = {

  findSale(saleNumber, userId,  callback){
    if (this._checkSaleNumber(saleNumber, callback)){

      var sale = this._findSaleFromGood(saleNumber);

      if (!sale){
        this._checkOtherLists(saleNumber, userId);
      }

      this.loadSale(sale || saleNumber, callback);
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
    if (InprogressLaws.get(saleNumber)){
      Err.thrw(Const.sale_in_progress, userId);
    }

    if (PendingLaws.find(saleNumber)){
      Err.thrw(Const.sale_in_pending, userId);
    }
  },

  _findSaleFromGood(saleNumber){
    return DoneLaws.get(saleNumber) || PickingLaws.get(saleNumber);
  },

  loadSale(sale, callback){
    var loader = new SaleLoader(sale)
    .loadClient()
    .loadItems()
    .run((loadedSale)=>{
      callback(loadedSale);
    });
  }

};
