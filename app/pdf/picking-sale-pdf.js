const DoneLaws = require('../laws/done-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PickingLaps = require('../handler/laps/picking-laps.js');

module.exports = {

  load(userId, saleNumber, callback){

    var sale = InprogressLaws.get(saleNumber) || DoneLaws.get(saleNumber);
    loadItems(sale, (sale)=>{

    });

    new SaleLoader(sale)
    .loadItems()
    .loadClient()
    .run((sale)=>{

    });
  }
};


/*function loadItems(sale, callback){
  if (!sale.items){
    PickingLaps.callLoadSaleItems(sale, function(saleResult){
      callback(saleResult);
    });
  }else{
    callback(sale);
  }
}

function loadClient(sale, callback){
  if (!sale.items){
    PickingLaps.callLoadSaleItems(sale, function(saleResult){
      callback(saleResult);
    });
  }else{
    callback(sale);
  }
}*/
