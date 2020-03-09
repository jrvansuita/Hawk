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
    this.date = store.created_at;
    this.subtotal = Floa.def(store.base_subtotal);
    this.discount = Floa.def(store.discount_amount);
    this.total = Floa.def(store.base_grand_total);
    this.weight = Floa.def(store.weight) < 1.000 ? Floa.def(store.weight) + 'g' : Floa.def(store.weight) + 'Kg';

    this.client = {
      name: store.customer_firstname + " " + store.customer_lastname,
      socialCode: store.customer_taxvat,
      dateOfBirth: Dat.format(new Date(store.customer_dob)),
      email: store.customer_email,
      tel: store.billing_address.telephone
    }

    this.shipping_address = {
      street: store.shipping_address.street.split(/\n/g)[0] + ', ' + store.shipping_address.street.split(/\n/g)[1],
      complement: store.shipping_address.street.split(/\n/g)[2],
      bairro: store.shipping_address.street.split(/\n/g)[3],
      city: store.shipping_address.city,
      state: store.shipping_address.region,
      cep: store.shipping_address.postcode
    }

    this.billing_address = {
      street: store.billing_address.street.split(/\n/g)[0] + ', ' + store.billing_address.street.split(/\n/g)[1],
      complement: store.billing_address.street.split(/\n/g)[2],
      bairro: store.billing_address.street.split(/\n/g)[3],
      city: store.billing_address.city,
      state: store.billing_address.region,
      cep: store.billing_address.postcode
    }

    this.payment = {
      method: store.payment.method,
      total: store.payment.base_amount_ordered,
      desc: store.payment.installment_description || store.payment.additional_information.mundipagg_creditcard_new_credito_parcelamento_1_1|| "1x (à vista)",
      boleto: store.payment.additional_information.BoletoUrl,
      boleto_expires: store.payment.additional_information["1_ExpirationDate"],
      status: store.status == 'pending_payment' ? (store.payment.amount_paid ? 'Pago' : 'Pagamento Pendente') : (store.payment.amount_paid ? 'Pago' : 'Não Pago'),
      coupon: store.coupon_code,
      discount_desc: store.discount_description
    }

    this.transport = {
      name: erp.transport,
      desc: store.shipping_description,
      cost: Floa.def(store.shipping_amount) == 0 ? "Frete Grátis" : Floa.def(store.shipping_amount),
      tracking: erp.codigoRastreamento,
      deliveryTime: erp.deliveryTime
    }

    this.comments = {
      store: store.status_history.filter((each) => {
        return (each.comment != null && each.comment != '[Intelipost Webhook] - ' && each.comment != '[ERP - ECCOSYS] - ');
      }),
      erp: erp.observacaoInterna,
    }

    var count = 0;
    erp.items.forEach((i) => {
      count += Floa.def(i.quantidade);
    });
    this.totalPecas = count;

    this.eccoItensQuantity = erp.items.length;
    this.magentoItensQuantity = store.items.filter((each) => {
      return each.parent_item_id === null;
    }).length
  };


}


class SaleItemWrapper{
  constructor(item){
    this.sku = item.codigo || item.sku;
    this.name = item.descricao || item.name;
    this.price = Floa.def(item.valor || item.price);
    this.discount = Floa.def(item.discount_amount || item.desconto_adm);
    this.total = Floa.def((item.price - item.discount_amount) || item.valor);
    this.quantity = Num.def(item.quantidade || item.qty_ordered);
    this.weight = Floa.def(item.weight) < 1.000 ? Floa.def(item.weight) + 'g' : Floa.def(item.weight) + 'Kg';
    this.changed = item.observacao ? item.observacao.includes('changed') : false;
    this.store = item.store === true;
    this.erp = item.erp === true;
  }
}
