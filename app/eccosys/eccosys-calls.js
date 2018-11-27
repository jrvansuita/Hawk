var Query = require('../util/query.js');
var Eccosys = require('../eccosys/eccosys.js');
const History = require('../bean/history.js');


var page_count = 100;

module.exports = {
  getSales: (from, to, page, callback) => {
    var query = new Query('$');

    query.add('dataConsiderada', 'dataFaturamento');
    query.addDate('fromDate', from);
    query.addDate('toDate', to);
    query.add('count', page_count);
    query.add('offset', page_count * page);
    Eccosys.get('pedidos' + query.build(), (data)=>{
      callback(JSON.parse(checkNoSale(data, '[]')));
    });
  },

  getSale(number, callback) {
    Eccosys.get('pedidos/' + number, (data)=>{
      callback(JSON.parse(checkNoSale(data, '{}'))[0]);
    });
  },

  getSaleItems(number, callback) {
    Eccosys.get('pedidos/' + number + '/items', (data)=>{
      callback(JSON.parse(checkNoSale(data, '[]')));
    });
  },


  getPickingSales(callback) {
    //Pronto para picking
    Eccosys.get('pedidos/situacao/3', (data)=>{
      callback(JSON.parse(checkEccoStatus(data, '[]')));
    });
  },

  getClient(id, callback) {
    Eccosys.get('clientes/' + id, (data)=>{
      callback(JSON.parse(checkNoSale(data, '{}'))[0]);
    });
  },

  getProduct(skuOrEan, callback) {
    Eccosys.get('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan), (data)=>{
      var parsed = JSON.parse(checkEccoStatus(data, '{}'));

      if (typeof parsed == 'string'){
        callback({error : parsed});
      }else{
        callback(parsed);
      }
    });
  },

  getStockHistory(sku, callback) {
    Eccosys.get('estoques/' + sku + '/registros', (rows)=>{
      callback(JSON.parse(rows));
    });
  },

  updateProductLocal(body, callback) {
    Eccosys.put('produtos', body, (res)=>{
      callback(JSON.parse(res));
    });
  },

  updateProductStock(sku, body, callback) {
    Eccosys.post('estoques/' + sku, body, (res)=>{
      callback(JSON.parse(res));
    });
  },

  updateSale(body, callback) {
    Eccosys.put('pedidos', body, (res)=>{
      callback(res);
    });
  },

  removeSaleItems(saleNumber, callback){
    Eccosys.delete('pedidos/' + saleNumber + '/items', (res)=>{
      if (callback){
        callback(res);
      }
    });
  },


  insertSaleItems(saleNumber, items, callback){
    Eccosys.post('pedidos/' + saleNumber + '/items', items, (res)=>{
      if (callback){
        callback(res);
      }
    });
  }
};




function checkEccoStatus(data, def){
  if (data.includes('503 Service Temporarily Unavailable')){
    History.error("API Eccosys indisponível no momento.");

    return def;
  }else if (data[0] == ('<')){
    console.log(data);
    return def;
  }

  return data;
}



function checkNoSale(data, def){
  if (data.includes('Nenhum pedido ou item encontrado')){
    return def;
  }

  return checkEccoStatus(data, def);
}
