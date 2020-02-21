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

    //Guardar cada item do eccosys
    this.erp.items.forEach((each) => {
      each.erp = true;
      items[each.codigo] = each;
    });

    //Guardar cada item do magento
    this.store.items.forEach((each) => {
      each.store = true;
      items[each.sku] = {...items[each.sku], ...each};
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
    this.nf = erp.numeroNotaFiscal;
    this.status = store.status;
    this.situation = Util.getSaleSituationName(parseInt(erp.situacao));
    this.pickingStatus = Util.getSaleStatusName(erp.pickingRealizado);
    this.saleDate = Dat.formatwTime(Dat.rollHour(new Date(store.created_at),-3));
    this.subtotal = Floa.def(store.base_subtotal);
    this.discount = Floa.def(store.discount_amount);
    this.total = Floa.def(store.base_grand_total);
    this.weight = Floa.def(store.weight);

    this.client = {
      name: store.customer_firstname + " " + store.customer_lastname,
      socialCode: store.customer_taxvat,
      dateOfBirth: Dat.formatwTime(new Date(store.customer_dob)),
      email: store.customer_email,
      tel: store.billing_address.telephone
    }

    this.shipping_address = {
      street: store.shipping_address.street.split(/\n/g)[0],
      number: store.shipping_address.street.split(/\n/g)[1],
      complement: store.shipping_address.street.split(/\n/g)[2],
      bairro: store.shipping_address.street.split(/\n/g)[3],
      city: store.shipping_address.city,
      state: store.shipping_address.region,
      cep: store.shipping_address.postcode
    }

    this.billing_address = {
      street: store.billing_address.street.split(/\n/g)[0],
      number: store.billing_address.street.split(/\n/g)[1],
      complement: store.billing_address.street.split(/\n/g)[2],
      bairro: store.billing_address.street.split(/\n/g)[3],
      city: store.billing_address.city,
      state: store.billing_address.region,
      cep: store.billing_address.postcode
    }

    this.payment = {
      method: store.payment.method,
      total: store.payment.base_amount_ordered,
      desc: store.payment.installment_description || "1x (à vista)",
      boleto: store.payment.additional_information.BoletoUrl,
      status: (store.payment.additional_information.BoletoTransactionStatusEnum || store.payment.additional_information["1_BoletoTransactionStatus"]) || store.payment.additional_information["1_CreditCardTransactionStatus"]
    }

    this.transport = {
      name: erp.transport,
      desc: store.shipping_description,
      cost: Floa.def(store.shipping_amount)
    }

    this.comments = {
      store: store.status_history,
      erp: erp.observacaoInterna,
    }
    this.eccoItensQuantity = erp.items.length;
    this.magentoItensQuantity = store.items.filter((each) => {
      return each.parent_item_id === null;
    }).length;
  };
}


class SaleItemWrapper{
  constructor(item){
    this.sku = item.codigo || item.sku;
    this.name = item.descricao || item.name;
    this.price = Floa.def(item.precoLista || item.price);
    this.discount = Floa.def(item.discount_amount || item.desconto_adm);
    this.total = Floa.def(item.price - item.discount_amount);
    this.quantity = Num.def(item.quantidade || item.qty_ordered);
    this.weight = Floa.def(item.weight);
    this.changed = item.observacao ? item.observacao.includes('changed') : false;
    this.store = item.store === true;
    this.erp = item.erp === true;
  }
}
