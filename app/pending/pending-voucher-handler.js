const EccosysStorer = require('../eccosys/eccosys-storer.js');
const SaleLoader = require('../loader/sale-loader.js');
const HistoryStorer = require('../history/history-storer.js');
const EmailBuilder = require('../email/builder/email-builder.js');
const PendingLaws = require('../laws/pending-laws.js');

module.exports = class PendingVoucherHandler{

  constructor(userId){
    this.userId = userId;
  }

  with(pending, voucher, value){
    this.pending = pending;
    this.voucher = voucher;
    this.totalValue = value;

    this.pending.voucher = voucher;

    return this;
  }

  _getVoucherObs(){
    return Const.voucher_items.format(this.voucher, this.sale.numeroPedido, this.totalValue, this._getPendingSkus(this.pending));
  }

  _findSale(number, callback){
    new SaleLoader(number)
    .loadItems()
    .loadClient()
    .run((sale) => {
      this.sale = sale;
      callback();
    });
  }

  _getPendingSkus(pending){
    return pending.sale.items.map((i) => {
      return i.codigo;
    }).join(', ');
  }

  _updateSaleWithRemainingItems(callback){
    new EccosysStorer().sale(this.sale.numeroPedido).items().delete().go(() => {
      new EccosysStorer().sale(this.sale.numeroPedido).items().insert(this.remainingItems).go(callback);
    });
  }

  _updateSaleObs(callback){
    var currentObs = this.sale.observacaoInterna;

    var body = {
      numeroPedido: this.sale.numeroPedido,
      observacaoInterna: currentObs + '\n' + this._getVoucherObs()
    };

    new EccosysStorer().sale().update([body]).go(callback);
  }

  _sendEmail(callback){
    new EmailBuilder()
    .template('VOUCHER')
    .to(this.sale.client.email)
    .receiveCopy()
    .reply(Params.replayEmail())
    .setData({
      cliente: this.sale.client,
      voucher: this.voucher,
      valor: this.totalValue,
      pedido: this.sale
    }).send(callback);
  }

  _handleRemainingItems(){
    this.remainingItems = this.sale.items.filter((item) => {
      return item.idProduto != this.pending.sale.items[0].idProduto;
    });
  }

  go(callback){
    this._findSale(this.pending.number, () => {
      this._handleRemainingItems();
      this._updateSaleWithRemainingItems(() => {
        this._updateSaleObs(() => {
          HistoryStorer.voucher(this.userId, this._getVoucherObs());
          //PendingLaws.incrementStatus(this.pending, this.userId, callback);
          this._sendEmail();
          if (callback){
            callback();
          }

          this._sendEmail();
        });
      });
    });
  }
}
