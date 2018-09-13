const EccosysCalls = require('../../eccosys/eccosys-calls.js');
const TransportLaws = require('../../laws/transport-laws.js');

module.exports={

   loadSaleItems(saleList, index, callback) {
    var sale = saleList[index];

    this.callLoadSaleItems(sale, (sale, items) =>{
      var currentLength = saleList.length;
      saleList[index] = sale;

      index++;
      console.log(index + '/' + (currentLength));

      if (index < currentLength) {
        this.loadSaleItems(saleList, index, callback);

        //Pelo menos 10 pedidos já foram carregados os itens
        if (index == 10) {
          callback();
        }
      }
      //No Sales to pick
      else if (currentLength == index){
        callback();
      }
    });
  },

   callLoadSaleItems(sale, callback){
    EccosysCalls.getSaleItems(sale.numeroPedido, (data) => {
      var items = JSON.parse(data);
      var saleResult = this.loadSingleAttrs(sale, items);
      callback(saleResult, items);
    });
  },

   loadSingleAttrs(sale, items){
    sale.transport = TransportLaws.put(sale.transportador);
    sale.items = items;
    sale.itemsQuantity = items.reduce(function(a, b) {
      return a + parseFloat(b.quantidade);
    }, 0);

    return sale;
  }
};
