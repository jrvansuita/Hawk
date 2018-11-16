const SaleLoader = require('../loader/sale-loader.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const HistoryStorer = require('../history/history-storer.js');



module.exports = class SaleItemSwapper{
  constructor(saleNumber, userId){
    this.saleNumber = saleNumber;
    this.saleLoader = new SaleLoader(saleNumber);
    this.userId = userId;
  }

  on(targetSku){
    this.targetSku = targetSku;
    return this;
  }

  to(swapSku){
    this.swapSku = swapSku;
    return this;
  }

  _swapTargetSku(){
    return this.sale.items.some((item)=>{
      var hasTargetSku = item.codigo.trim().toLowerCase() == this.targetSku.trim().toLowerCase();

      if (hasTargetSku){
        item.idProduto = this.swapProduct.id;
        item.codigo = this.swapProduct.codigo;
        item.descricao = this.swapProduct.nome;
        item.gtin = this.swapProduct.gtin;
      }

      return hasTargetSku;
    });
  }

  _loadProduct(sku, callback){
    EccosysCalls.getProduct(sku,(product)=>{
      callback(product);
    });
  }

  go(callback){
    this._loadProduct(this.swapSku, (swapProduct)=>{
      this.swapProduct = swapProduct;

      this.saleLoader
      .loadItems()
      .run((sale)=>{
        this.sale = sale;

        console.log('Vai trocar');
        sale.items.forEach((item)=>{
          console.log(item.codigo + ' ' + item.descricao);
        });


        if (this._swapTargetSku()){
          console.log('removeu');
           EccosysCalls.removeSaleItems(this.sale.numeroPedido, (res)=>{
             console.log(res);
             EccosysCalls.insertSaleItems(this.sale.numeroPedido, this.sale.items, (res)=>{
               sale.items.forEach((item)=>{
                 console.log(item.codigo + ' ' + item.descricao);
               });

               
               callback(true);
               HistoryStorer.swapItems(this.sale.numeroPedido, this.targetSku, this.swapSku, this.userId);
             });
           });
        }else{
          callback(false);
        }

      });

    });
  }


};
