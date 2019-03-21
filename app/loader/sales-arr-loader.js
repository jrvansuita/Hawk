const SaleLoader = require('../loader/sale-loader.js');

module.exports= class SalesArrLoader {

  constructor(saleList){
    this.saleList = saleList;

    this.initialLength = saleList.length;
    this.staticIndex = 0;

    this.createPool();
  }

    setOnError(onError){
      this.onError = onError;
      return this;
    }


  createPool(){
    this.pool = [];
    this.poolIndex = 0;

    this.saleList.forEach((each)=>{
      this.pool.push(each.numeroPedido);
    });
  }

  onLastSaleLoaded(callback){
    this.onLastSaleLoaded = callback;
    return this;
  }

  loadClient(callback){
    this.loadClient = callback;
    return this;
  }

  loadItems(callback){
    this.loadItems = callback;
    return this;
  }

  onEverySaleLoaded(callback){
    this.onEverySaleLoaded = callback;
    return this;
  }

  getSaleIndex(sale){
    return this.saleList.findIndex(s => s.numeroPedido == (sale.numeroPedido || sale));
  }

  removeSale(sale){
    this.saleList.splice(this.getSaleIndex(sale), 1);
  }

  getSale(saleNumber){
    return this.saleList[this.getSaleIndex(saleNumber)];
  }

  onFilter(callback){
    this.onFilter = callback;
    return this;
  }

  //Remove ou não uma sale
  _filter(sale){
    var removed = false;

    if (this.onFilter){
      removed = !this.onFilter(sale);
      if (removed){
        this.removeSale(sale);
      }
    }

    return !removed;
  }

  getCurrentPoolSale(){
    return this.pool[this.poolIndex];
  }

  _load(onFinished){
    var sale = this.getSale(this.getCurrentPoolSale());

    var saleLoader = new SaleLoader(sale)
    .setOnError(this.onError);

    if (this.loadClient){
      saleLoader.loadClient(this.loadClient);
    }

    if (this.loadItems){
      saleLoader.loadItems(this.loadItems);
    }

    saleLoader.run((sale)=>{

      this.saleList[this.getSaleIndex(sale)] = sale;

      if (this._filter(sale) && this.onEverySaleLoaded){
        this.onEverySaleLoaded(sale);
      }

      var poolLength = this.pool.length;

      this.poolIndex++;
      this.staticIndex++;
      console.log(sale.numeroPedido + ' - ' + sale.data + ' | ' + this.staticIndex + '/' + (this.initialLength));

      if (this.poolIndex < poolLength) {
        this._load(onFinished);

        //Pelo menos 10 pedidos já foram tratados e podem estar aparecendo
        if (this.staticIndex == 3) {
          onFinished();
        }
      }
      //No Sales to pick | Or finished loading sales
      else if (poolLength == this.poolIndex){
        onFinished();

        if (this.staticIndex > 0){
          if (this.onLastSaleLoaded){
            this.onLastSaleLoaded();
          }
        }
      }
    });
  }

  run(onFinished){
    this._load(onFinished);
  }




};
