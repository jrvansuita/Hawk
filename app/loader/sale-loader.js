const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports= class SaleLoader {

  constructor(data){
    this.sale = data;
    this.list = [];
  }

  _callbackHit(onCallNext, onCallOuter){
    if (typeof onCallNext === "function"){
      onCallNext();
    }

    if (typeof onCallOuter === "function"){
      onCallOuter(this.sale);
    }
    this.checkTerminate();
  }

  loadSale(saleNumber, onCallOuter){
    EccosysCalls.getSale(saleNumber, (sale)=>{
      this.sale = JSON.parse(sale)[0];
      onCallOuter(sale);
    });
  }

  loadClient(onCallOuter){

    var func = (onCallNext)=>{
      if (this.sale.idContato && !this.sale.client){
        EccosysCalls.getClient(this.sale.idContato, (data)=>{
          var client = JSON.parse(data)[0];
          this.sale.client = client;
          this._callbackHit(onCallNext, onCallOuter);
        });
      }else{
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(func);


    return this;
  }

  loadItems(onCallOuter, ifNotHas){

    var self = this;

    var func = (onCallNext)=>{

      if((!this.sale.items && ifNotHas) || !ifNotHas){
        EccosysCalls.getSaleItems(this.sale.numeroPedido, (data) => {
          var items = JSON.parse(data);
          this.sale.transport = Util.twoNames(this.sale.transportador, Const.no_transport);
          this.sale.items = items;
          this.sale.itemsQuantity = items.reduce(function(a, b) {
            return a + parseFloat(b.quantidade);
          }, 0);

          this._callbackHit(onCallNext, onCallOuter);
        });
      }else{
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(func);

    return this;
  }


  loadProducts(onCallOuter){
    var func = (onCallNext)=>{

      var index = this.sale.items.length;
      var products = [];

      this.sale.items.forEach((item)=>{
        EccosysCalls.getProduct(item.codigo, (product)=>{
          index--;
          products.push(product);

          if(index == 0){
            this._callbackHit(onCallNext, ()=>{
               onCallOuter(products);
            });
          }
        });
      });
    };
  }

  callFuncs(index){
    if (index < this.list.length){
      this.list[index](()=>{
        index++;
        this.callFuncs(index);
      });
    }
  }

  checkTerminate(){
    this.list.splice(-1,1);

    if (this.list.length == 0){
      if (typeof this.onFinished == 'function'){
        this.onFinished(this.sale);
      }
    }
  }

  run(onFinished){
    this.onFinished = onFinished;

    if (typeof this.sale !== 'object'){
      this.loadSale(this.sale, (sale)=>{
        this.callFuncs(0);
      });
    }else{
      this.callFuncs(0);
    }
  }



};
