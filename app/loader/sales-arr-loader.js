const SaleLoader = require('../loader/sale-loader.js');

module.exports= class SalesArrLoader {

  constructor(saleList){
    this.saleList = saleList;
    this.index = 0;


    this.initialLength = saleList.length;
    this.staticIndex = 0;
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

  onFilter(callback){
    this.onFilter = callback;
    return this;
  }

  //Remove ou não uma sale
  _filter(sale){
    var removed = false;

    if (this.onFilter){
      removed = !this.onFilter(sale, this.index);
      if (removed){
        this.saleList.splice(this.index, 1);
        this.index--;
      }
    }

    return !removed;
  }

  _load(onFinished){
    //console.log(this.saleList[this.index].numeroPedido);
    var saleLoader = new SaleLoader(this.saleList[this.index]);

    if (this.loadClient){
      saleLoader.loadClient(this.loadClient);
    }

    if (this.loadItems){
      saleLoader.loadItems(this.loadItems);
    }

    saleLoader.run((sale)=>{
      this.saleList[this.index] = sale;

      if (this._filter(sale) && this.onEverySaleLoaded){
        this.onEverySaleLoaded(sale, this.index);
      }

      var currentLength = this.saleList.length;

      this.index++;
      this.staticIndex++;
      console.log(sale.numeroPedido + ' | ' + this.staticIndex + '/' + (this.initialLength));

      if (this.index < currentLength) {
        this._load(onFinished);

        //Pelo menos 10 pedidos já foram tratados e podem estar aparecendo
        if (this.staticIndex == 10) {
          onFinished();
        }
      }
      //No Sales to pick | Or finished loading sales
      else if (currentLength == this.index){
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
