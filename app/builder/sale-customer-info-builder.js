const SaleLoader = require('../loader/sale-loader.js');
const MagentoCalls = require('../magento/magento-calls.js');

module.exports = class SaleCustomerInfoBuilder{

  constructor(saleNumber){
    this.saleNumber = saleNumber;
  }

  _get(callback){
    new SaleLoader(this.saleNumber)
    .loadItems()
    .run((erpSale) => {
      new MagentoCalls().sale(erpSale.numeroDaOrdemDeCompra).then((storeSale) => {
        this.store = storeSale;
        this.erp = erpSale;
        callback();
      });
    });
  }

  _handleSale(){
    this.sale = new SaleWrapper(this.store, this.erp);
  }

  _handleItems(){
    var items = {};

    //Remover itens inuteis
    this.store.items = this.store.items.filter((each) => {
      return each.parent_item_id === null;
    });

    //Guardar cada item do magento
    this.store.items.forEach((each) => {
      each.store = true;
      items[each.sku] = each;
    });

    //Guardar cada item do eccosys
    this.erp.items.forEach((each) => {
      each.erp = true;
      items[each.codigo] = each;
    });

    //Normalizar os Items
    var resultItems = [];

    Object.values(items).forEach((each) => {
      resultItems.push(new SaleItemWrapper(each));
    });

    this.sale.items = resultItems;
  }

  _getProvisorio(){
    return {erp: Util.removeNullElements(this.erp) , store : Util.removeNullElements(this.store)};
  }


  load(callback){
    this._get(() => {
      this._handleSale();
      this._handleItems();

      if (callback){
        callback(this.sale, this._getProvisorio());
      }
    });
  }

}



class SaleWrapper{
  constructor(store, erp){
    this.number = erp.numeroPedido;
    this.oc = store.increment_id;
  }
}


class SaleItemWrapper{
  constructor(item){
    this.sku = item.codigo || item.sku;
    this.name = item.descricao || item.name;
    this.price = Floa.def(item.precoLista || item.price);
    this.quantity = Num.def(item.quantidade || item.qty_ordered);
    this.changed = item.observacao ? item.observacao.includes('changed') : false;
    this.store = item.store === true;
    this.erp = item.erp === true;

  }
}
