const EccosysCalls = require('../../eccosys/eccosys-calls.js');
const TransportLaws = require('../../laws/transport-laws.js');
const UfLaws = require('../../laws/uf-laws.js');

module.exports={

  loadSaleItems(saleList, index, onFinished) {


    var sale = saleList[index];

    this.callLoadClient(sale, (sale)=>{

      this.callLoadSaleItems(sale, (sale, items) =>{
        
        saleList[index] = sale;

        index++;

        var currentLength = saleList.length;
        console.log(index + '/' + (currentLength));

        if (index < currentLength) {
          this.loadSaleItems(saleList, index, onFinished);

          //Pelo menos 10 pedidos já foram carregados os itens
          if (index == 10) {
            onFinished();
          }
        }
        //No Sales to pick
        else if (currentLength == index){
          onFinished();
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
    sale.transport = TransportLaws.excluir_put(sale.transportador);
    sale.items = items;
    sale.itemsQuantity = items.reduce(function(a, b) {
      return a + parseFloat(b.quantidade);
    }, 0);

    return sale;
  }
};
