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
  }
};