const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports= class SaleLoader {

  constructor(data){
    this.sale = data;
    this.list = [];
  }

  _callbackHit(callback){
    if (typeof callback === "function"){
      callback(this.sale);
    }
    this.checkTerminate();
  }

  loadSale(saleNumber, callback){
    EccosysCalls.getSale(saleNumber, (sale)=>{
      this.sale = JSON.parse(sale)[0];
      callback(sale);
    });
  }

  loadClient(callback){

    var func = ()=>{
      if (this.sale.idContato && !this.sale.client){
        EccosysCalls.getClient(this.sale.idContato, (data)=>{
          var client = JSON.parse(data)[0];
          this.sale.client = client;
          this._callbackHit(callback);
        });
      }else{
        this._callbackHit(callback);
      }
    };

    this.list.push(func);


    return this;
  }

  loadItems(callback, ifNotHas){

    var self = this;

    var func = ()=>{
      if((!this.sale.items && ifNotHas) || !ifNotHas){
        EccosysCalls.getSaleItems(this.sale.numeroPedido, (data) => {
          var items = JSON.parse(data);
          this.sale.transport = Util.twoNames(this.sale.transportador, Const.no_transport);
          this.sale.items = items;
          this.sale.itemsQuantity = items.reduce(function(a, b) {
            return a + parseFloat(b.quantidade);
          }, 0);

          this._callbackHit(callback);
        });
      }else{
        this._callbackHit(callback);
      }
    };

    this.list.push(func);

    return this;
  }

  callFuncs(){
    this.list.forEach((func)=>{
      func();
    });
  }

  checkTerminate(){
    this.list.splice(-1,1);

    if (this.list.length == 0){
      this.onFinished(this.sale);
    }
  }

  run(onFinished){
    this.onFinished = onFinished;

    if (typeof this.sale !== 'object'){
      this.loadSale(this.sale, (sale)=>{
        this.callFuncs();
      });
    }else{
      this.callFuncs();
    }
  }



};
