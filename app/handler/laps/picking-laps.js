const EccosysCalls = require('../../eccosys/eccosys-calls.js');
const TransportLaws = require('../../laws/transport-laws.js');
const UfLaws = require('../../laws/uf-laws.js');

module.exports={

  loadSaleItems(saleList, index, callback) {
    var sale = saleList[index];

    this.callLoadClient(sale, (sale)=>{

      this.callLoadSaleItems(sale, (sale, items) =>{

        var currentLength = saleList.length;
        saleList[index] = sale;

        //var c = global.staticPickingList[index].client;

        //console.log(sale.numeroPedido + " -> " + sale.idContato + " -> " + (c ? c.nome : "--") + " -> " + (c ? c.uf: "--"));

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
    });
  },

  callLoadClient(sale, callback){
    EccosysCalls.getClient(sale.idContato, (data)=>{
      var client = JSON.parse(data)[0];
      sale.client = client;
      UfLaws.put(sale.client.uf);

      callback(sale);
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
