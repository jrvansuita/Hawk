var Query = require('../util/query.js');
var Eccosys = require('../eccosys/eccosys.js');

var page_count = 100;

module.exports = {
  getSales: (from, to, page, callback) => {
    var query = new Query('$');

    query.add('dataConsiderada', 'dataFaturamento');
    query.addDate('fromDate', from);
    query.addDate('toDate', to);
    query.add('count', page_count);
    query.add('offset', page_count * page);
    Eccosys.get('pedidos' + query.build(), callback);
  },

  getSale(number, callback) {
    Eccosys.get('pedidos/' + number, callback);
  },

  getSaleItems(number, callback) {
    Eccosys.get('pedidos/' + number + '/items', callback);
  },


  getPickingSales(callback) {
    //Pronto para picking
    Eccosys.get('pedidos/situacao/3', (data)=>{
      callback(checkEccoStatus(data, []));
    });
  },

  getClient(id, callback) {
    Eccosys.get('clientes/' + id, (data)=>{
      callback(checkEccoStatus(data, {}));
    });
  },

  getProduct(skuOrEan, callback) {
    Eccosys.get('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan), (data)=>{
      var parsed = JSON.parse(data);

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
  }
};




function checkEccoStatus(data, def){
  if (data.includes('503 Service Temporarily Unavailable')){
    if (History){
      History.error("API Eccosys indisponível no momento.");
    }
    return def;
  }

  return data;
}
