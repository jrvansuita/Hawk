const EccosysCalls = require('../../eccosys/eccosys-calls.js');
const TransportLaws = require('../../laws/transport-laws.js');
const UfLaws = require('../../laws/uf-laws.js');
const SaleLoader = require('../../loader/sale-loader.js');

module.exports={

  loadSaleItems(saleList, index, callback) {
    var sale = saleList[index];

    var saleLoader = new SaleLoader(sale);

    saleLoader.loadClient((sale)=>{
      UfLaws.put(sale.client.uf);
    }).loadItems((sale)=>{
       TransportLaws.put(sale.transportador);
    });

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
  }

};
