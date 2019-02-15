var Query = require('../util/query.js');
//var Eccosys = require('../eccosys/eccosys.js');
var EccosysApi = require('../eccosys/new-eccosys.js');
const History = require('../bean/history.js');


//Situações dos pedidos
//-1 - Aguardando pagamento
//0  - Em aberto
//1  - Atendido
//2  - Cancelado
//3  - Pronto para picking
//4  - Pagamento em análise


var page_count = 100;

module.exports = {
  getSales: (from, to, page, callback) => {
    var query = new Query('$');

    query.add('dataConsiderada', 'dataFaturamento');
    query.addDate('fromDate', from);
    query.addDate('toDate', to);
    query.add('count', page_count);
    query.add('offset', page_count * page);
    new EccosysApi('pedidos' + query.build()).get((data)=>{
      callback(JSON.parse(checkNoSale(data, '[]')));
    });
  },

  getSale(number, callback) {
    if (number == undefined){
      callback({});
    }else{
      new EccosysApi('pedidos/' + number).get((data)=>{
        callback(JSON.parse(checkNoSale(data, '{}'))[0]);
      });
    }
  },

  getSaleItems(number, callback) {
    new EccosysApi('pedidos/' + number + '/items').get((data)=>{
      callback(JSON.parse(checkNoSale(data, '[]')));
    });
  },


  getPickingSales(callback) {
    //Pronto para picking
    new EccosysApi('pedidos/situacao/3').get((data)=>{
      callback(JSON.parse(checkEccoStatus(data, '[]')));
    });
  },

  getClient(id, callback) {
    new EccosysApi('clientes/' + id).get((data)=>{
      callback(JSON.parse(checkNoSale(data, '{}'))[0]);
    });
  },

  getProduct(skuOrEan, callback) {
    new EccosysApi('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan))
    .get((data)=>{
      var parsed = JSON.parse(checkEccoStatus(data, '{}'));

      if (typeof parsed == 'string'){
        callback({error : parsed});
      }else{
        callback(parsed);
      }
    });
  },

  getStockHistory(sku, callback) {
    new EccosysApi('estoques/' + sku + '/registros').get((rows)=>{
      callback(JSON.parse(rows));
    });
  },

  updateProductLocal(body, callback) {
    new EccosysApi('produtos').setBody(body).put((res)=>{
      callback(JSON.parse(res));
    });
  },

  updateProductStock(sku, body, callback) {
    new EccosysApi('estoques/' + sku).setBody(body).post((res)=>{
      callback(JSON.parse(res));
    });
  },

  updateSale(body, callback) {
    new EccosysApi('pedidos').setBody(body).put((res)=>{
      callback(res);
    });
  },

  packingPostNF(user, saleNumber, callback){
    new EccosysApi('nfes/' + saleNumber).setBody({}).withUser(user).post((res)=>{
      callback(res);
    });
  },

  loadDanfe(res, nfNumber){
    new EccosysApi('danfes/' + nfNumber + '/pdf').download(res, nfNumber + '.pdf');
  },

  loadTransportTag(res, idNfe){
    new EccosysApi('etiquetas/' + idNfe).download(res, idNfe + '.pdf');
  },


  removeSaleItems(saleNumber, callback){
    new EccosysApi('pedidos/' + saleNumber + '/items').delete((res)=>{
      if (callback){
        callback(res);
      }
    });
  },

  insertSaleItems(saleNumber, items, callback){
    new EccosysApi('pedidos/' + saleNumber + '/items').setBody(items).post((res)=>{
      if (callback){
        callback(res);
      }
    });
  }
};




function checkEccoStatus(data, def){
  global.eccoConnError = undefined;

  if (data.includes('503 Service Temporarily Unavailable')){
    History.error("API Eccosys indisponível no momento.");
    global.eccoConnError = true;

    return def;
  }else if (data[0] == ('<')){
    console.log(data);
    return def;
  }else if (data.length == 0){
    return def;
  }

  return data;
}



function checkNoSale(data, def){
  var parsed = JSON.parse(data);

  if (typeof parsed == 'string'){
    console.log(parsed);
    return def;
  }

  return checkEccoStatus(data, def);
}
