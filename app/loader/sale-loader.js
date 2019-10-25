const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const History = require('../bean/history.js');


const Err = require('../error/error.js');

module.exports= class SaleLoader {

  constructor(data){
    this.initialData = data;
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
    //this.checkTerminate();
  }

  getSkusFromSale(){
    if(this.sale.items){
      return this.sale.items.map((i)=>{
        return i ? i.codigo : '';
      });

    }else{
      return [];
    }
  }

  setOnError(onError){
    this.onError = onError;
    return this;
  }

  loadSale(saleNumber, onCallOuter){
    new EccosysProvider()
    .setOnError(this.onError)
    .sale(saleNumber).go((sale)=>{


      //Provisório
      if(!sale){
        throw Err.thrw('Pedido não carregou: ' + saleNumber);
      }
      //Provisório

      this.sale = sale;
      onCallOuter(sale);
    });
  }

  loadClient(onCallOuter){

    var funcClient = (onCallNext)=>{

      if (this.sale.idContato && !this.sale.client){
        new EccosysProvider()
        .setOnError(this.onError)
        .client(this.sale.idContato).go((client)=>{

          if (Object.keys(client).length === 0){
            History.error(e, null, 'Erro ao carregar cliente ' + this.sale.idContato + ' do pedido ' + this.sale.numeroPedido);
          }

          this.sale.client = client;
          this._callbackHit(onCallNext, onCallOuter);
        });
      }else{
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(funcClient);


    return this;
  }

  reloadItems(onCallOuter){
    return this.loadItems(onCallOuter, true);
  }

  loadItems(onCallOuter, force){

    var self = this;

    var funcItems = (onCallNext)=>{

      if((!this.sale.items) || (force)){
        new EccosysProvider()
        .setOnError(this.onError)
        .saleItems(this.sale.numeroPedido).go((items) => {

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

    this.list.push(funcItems);

    return this;
  }

  loadItemsDeepAttrs(onCallOuter){
    var funcItemsWeight = (onCallNext)=>{

      new EccosysProvider()
      .setOnError(this.onError)
      .skus(this.getSkusFromSale()).go((products)=>{
        for (let item of this.sale.items) {
          for (let product of products) {
            if (item.codigo == product.codigo){
              item.liq = product.pesoLiq;
              item.bru = product.pesoBruto;
              item.local = product.localizacao;
              item.ncm = product.cf;
              break;
            }
          }
        }

        this._callbackHit(onCallNext, onCallOuter);
      });

    };

    this.list.push(funcItemsWeight);

    return this;
  }

  loadNfe(onCallOuter){
    var funcNfe = (onCallNext)=>{

      if (this.sale.numeroNotaFiscal && !this.sale.nfe){
        new EccosysProvider()
        .setOnError(this.onError)
        .nfe(this.sale.numeroNotaFiscal).go((nfe)=>{
          this.sale.nfe = nfe;
          this._callbackHit(onCallNext, onCallOuter);
        });
      }else{
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(funcNfe);

    return this;
  }


  loadProducts(onCallOuter){
    var funcProducts = (onCallNext)=>{

      new EccosysProvider()
      .setOnError(this.onError)
      .skus(this.getSkusFromSale()).go((products)=>{
        this._callbackHit(onCallNext, ()=>{
          onCallOuter(products, this.sale);
        });

      });
    };

    this.list.push(funcProducts);

    return this;
  }

  callFuncs(index){
    if (index < this.list.length){
      this.list[index](()=>{
        index++;
        this.callFuncs(index);
      });
    }else{
      if (typeof this.onFinished == 'function'){
        this.onFinished(this.sale);
        this.onFinished = null;
      }
    }
  }

  run(onFinished){
    this.onFinished = onFinished;

    if (typeof this.sale !== 'object'){
      this.loadSale(this.sale, (sale)=>{
        if (sale && this.list.length != 0){
          this.callFuncs(0);
        }else{
          if (onFinished){
            onFinished(sale);
          }
        }
      });
    }else{
      this.callFuncs(0);
    }
  }



};
