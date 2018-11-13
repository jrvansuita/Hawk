const EccosysCalls = require('../../eccosys/eccosys-calls.js');

module.exports= class SaleLoader {

  constructor(data){
    this.sale = data;

  }


  loadClient(callback){
    if (this.sale.idContato && !this.sale.client){
      EccosysCalls.getClient(this.sale.idContato, (data)=>{
        var client = JSON.parse(data)[0];
        this.sale.client = client;
        callback(this.sale);
      });
    }else{
      callback(this.sale);
    }

    return this;
  }

  loadItems(callback){
    EccosysCalls.getSaleItems(this.sale.numeroPedido, (data) => {
      var items = JSON.parse(data);

      this.sale.transport = Util.twoNames(this.sale.transportador, Const.no_transport);
      this.sale.items = items;
      this.sale.itemsQuantity = items.reduce(function(a, b) {
        return a + parseFloat(b.quantidade);
      }, 0);

      callback(this.sale);
    });

    return this;
  }

  run(callback){

    if (typeof sale !== 'object'){
      this.loadSale(sale, (sale)=>{
        this.sale = sale;
        _runner();
      });
    }else{
      _runner();
    }
  }



};
