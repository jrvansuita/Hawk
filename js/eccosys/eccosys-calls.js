var Query = require('../util/query.js');
var Eccosys = require('../eccosys/eccosys.js');

var page_count = 100;

module.exports = {
  getSales: (from, to, page, callback) => {
    var query = new Query('$');

    query.add('dataConsiderada', 'dataFaturamento');
    query.addDate('from', from);
    query.addDate('to', to);
    query.add('count', page_count);
    query.add('offset', page_count * page);

    Eccosys.get('pedidos' + query.build(), callback);
  }
};