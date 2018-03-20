var EccosysCalls = require('../eccosys/eccosys-calls.js');
var DataBase = require('../db/DataBase.js');
var Sale = require('../bean/sale.js');


module.exports = {

  sync() {



    EccosysCalls.getSales(new Date(), new Date(), 1, function(data) {
      var sales = JSON.parse(data);

      sales.forEach((pedido, index) => {
        var storage = DataBase.sales();
        var sale = new Sale(pedido.numeroPedido);

        storage.update({
          number: sale.getNumber()
        }, product, {
          upsert: true
        });

      });

    });
  }

};