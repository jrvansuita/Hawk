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
    Eccosys.get('pedidos/situacao/3', callback);
  },

  getClient(id, callback) {
    Eccosys.get('clientes/' + id, callback);
  },

  getProduct(skuOrEan, callback) {
    Eccosys.get('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan), (product)=>{
      callback(JSON.parse(product));
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
