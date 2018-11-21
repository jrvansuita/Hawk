const SaleLoader = require('../loader/sale-loader.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');
const HistoryStorer = require('../history/history-storer.js');
const Err = require('../error/error.js');
const PendingHandler = require('../handler/pending-handler.js');


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

  with(quantity){
    this.quantity = parseInt(quantity);
    return this;
  }

  _checkSaleStatus(){
    if (this.sale.situacao != 3){
      this._onError(new Err(Const.sale_not_picking.format(this.sale.numeroPedido), this.userId));
      return false;
    }else{
      return true;
    }
  }

  _checkAllreadyHasSwapSku(){
    var has = this.sale.items.some((item)=>{
      return item.codigo.toLowerCase() == this.swapSku.trim().toLowerCase();
    });

    if (has){
        this._onError(new Err(Const.product_in_sale.format(this.swapSku.trim()), this.userId));
    }

    return !has;
  }

  _swapTargetSku(){
    var hasTargetSku = false;

    for(var i=0; i < this.sale.items.length; i++){
      var item = this.sale.items[i];

      hasTargetSku= item.codigo.trim().toLowerCase() == this.targetSku.trim().toLowerCase();

      if (hasTargetSku){
        if (item.quantidade > this.quantity){
          item.quantidade -= this.quantity;
          this.sale.items.push(this._setAttrs(Util.clone(item)));
          break;
        }else{
          this._setAttrs(item);
          break;
        }
      }
    }

    if (!hasTargetSku){
      this._onError(new Err(Const.product_not_in_sale.format(this.targetSku, this.sale.numeroPedido), this.userId));
    }

    return hasTargetSku;
  }

  _setAttrs(item){
    item.idProduto = this.swapProduct.id;
    item.codigo = this.swapProduct.codigo;
    item.descricao = this.swapProduct.nome;
    item.gtin = this.swapProduct.gtin;
    item.quantidade = this.quantity;


    this.changedItem = item;

    return item;
  }

  _loadProduct(sku, callback){
    EccosysCalls.getProduct(sku,(product)=>{
      callback(product);
    });
  }

  _updateSaleObs(){
    var currentObs = this.sale.observacaoInterna;

    var body = {
      situacao: 3,
      numeroPedido: this.sale.numeroPedido,
      observacaoInterna: currentObs + '\n' + Const.swaped_items.format(this.quantity, this.targetSku, this.swapSku, this.sale.numeroPedido)
    };

    EccosysCalls.updateSale([body], ()=>{});
  }

  _onError(err){
    if (this.onResponse){
      this.onResponse(null, err);
    }
  }

  go(callback){
    this.onResponse = callback;

    this._loadProduct(this.swapSku, (swapProduct)=>{
      this.swapProduct = swapProduct;
      this.saleLoader
      .loadItems()
      .run((sale)=>{
        this.sale = sale;

        if (this._checkSaleStatus() && this._checkAllreadyHasSwapSku()){
          if (this._swapTargetSku()){
            EccosysCalls.removeSaleItems(this.sale.numeroPedido, (res)=>{
              EccosysCalls.insertSaleItems(this.sale.numeroPedido, this.sale.items, (res)=>{

                if (this.onResponse){
                  this.onResponse(true);
                }

                HistoryStorer.swapItems(this.sale.numeroPedido, this.targetSku, this.swapSku, this.quantity, this.userId);
                this._updateSaleObs();

                PendingHandler.updateItem(this.sale.numeroPedido, this.targetSku, this.changedItem, ()=>{});
              });
            });
          }
        }
      });
    });
  }


};
