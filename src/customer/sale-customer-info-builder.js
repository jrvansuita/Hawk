const SaleLoader = require('../loader/sale-loader.js');
const MagentoCalls = require('../magento/magento-calls.js');
const Enum = require('../bean/enumerator.js');

module.exports = class SaleCustomerInfoBuilder {
  constructor(saleNumber) {
    this.saleNumber = saleNumber;
  }

  _get(callback) {
    new SaleLoader(this.saleNumber)
      .loadItems()
      .loadNfe()
      .run((erpSale) => {
        new MagentoCalls().sale(erpSale.numeroDaOrdemDeCompra).then((storeSale) => {
          this.store = storeSale;
          this.erp = erpSale;
          callback();
        });
      });
  }

  async _handleSale() {
    this.sale = await new SaleWrapper().build(this.store, this.erp);
  }

  _handleItems() {
    var items = {};

    // Remover itens inuteis
    this.store.items = this.store.items.filter((each) => {
      return each.parent_item_id === null;
    });

    // Guardar cada item do eccosys
    this.erp.items.forEach((each) => {
      each.erp = true;
      items[each.codigo] = each;
    });

    // Guardar cada item do magento
    this.store.items.forEach((each) => {
      each.store = true;
      items[each.sku] = { ...items[each.sku], ...each };
    });

    // Normalizar os Items
    var resultItems = [];

    Object.values(items).forEach((each) => {
      resultItems.push(new SaleItemWrapper(each));
    });

    this.sale.items = resultItems;
  }

  _getProvisorio() {
    return { erp: global.Util.removeNullElements(this.erp), store: global.Util.removeNullElements(this.store) };
  }

  load(callback) {
    this._get(async () => {
      await this._handleSale();
      this._handleItems();

      if (callback) {
        callback(this.sale, this._getProvisorio());
      }
    });
  }
};

class SaleWrapper {
  async build(store, erp) {
    this.number = erp.numeroPedido;
    this.oc = store.increment_id;
    this.nf = erp.numeroNotaFiscal;
    this.status = store.status;
    this.situation = (await Enum.on('ECCO-SALE-STATUS').hunt(erp.situacao, 'value'))?.name;
    this.pickingStatus = (await Enum.on('ECCO-SALE-STATUS').hunt(erp.pickingRealizado, 'value'))?.name;
    this.saleDate = global.Dat.formatwTime(global.Dat.rollHour(new Date(store.created_at), -3));
    this.date = store.created_at;
    this.subtotal = global.Floa.def(store.base_subtotal);
    this.discount = global.Floa.def(store.discount_amount);
    this.total = global.Floa.def(store.base_grand_total);
    this.coleted = erp.pedidoColetado ? 'Sim' : 'Não';
    this.idOrdemColeta = erp.nfe ? erp.nfe.idOrdemColeta : '';
    this.weight = erp.pesoBruto ? (erp.pesoBruto < 1.0 ? erp.pesoBruto + 'g' : erp.pesoBruto + 'Kg') : store.weight < 1.0 ? store.weight + 'g' : store.weight + 'Kg';

    this.client = {
      name: store.customer_firstname + ' ' + store.customer_lastname,
      socialCode: store.customer_taxvat,
      dateOfBirth: global.Dat.format(new Date(store.customer_dob)),
      email: store.customer_email,
      tel: store.billing_address.telephone,
    };

    this.client.nome = this.client.name;

    this.shipping_address = {
      street: store.shipping_address.street.split(/\n/g)[0] + ', ' + store.shipping_address.street.split(/\n/g)[1],
      complement: store.shipping_address.street.split(/\n/g)[2],
      bairro: store.shipping_address.street.split(/\n/g)[3],
      city: store.shipping_address.city,
      state: store.shipping_address.region,
      cep: store.shipping_address.postcode,
      reference: store.shipping_address.pto_referencia,
    };

    this.billing_address = {
      street: store.billing_address.street.split(/\n/g)[0] + ', ' + store.billing_address.street.split(/\n/g)[1],
      complement: store.billing_address.street.split(/\n/g)[2],
      bairro: store.billing_address.street.split(/\n/g)[3],
      city: store.billing_address.city,
      state: store.billing_address.region,
      cep: store.billing_address.postcode,
      reference: store.billing_address.pto_referencia,
    };

    this.payment = {
      method: store.payment.method,
      total: store.payment.base_amount_ordered,
      desc: store.payment.installment_description || store.payment.additional_information.mundipagg_creditcard_new_credito_parcelamento_1_1 || '1x (à vista)',
      boleto: store.payment.additional_information.BoletoUrl,
      boleto_expires: store.payment.additional_information['1_ExpirationDate'],
      status: store.status === 'pending_payment' ? (store.payment.amount_paid ? 'Pago' : 'Pagamento Pendente') : store.payment.amount_paid ? 'Pago' : 'Não Pago',
      coupon: store.coupon_code,
      discount_desc: store.discount_description,
    };
    this.transport = {
      name: erp.transport,
      transportIcon: (await Enum.on('TRANSPORT-IMGS').hunt(erp.transport.toLowerCase(), 'value'))?.icon,
      desc: store.shipping_description,
      cost: global.Floa.def(store.shipping_amount) === 0 ? 'Frete Grátis' : global.Floa.def(store.shipping_amount),
      tracking: erp.codigoRastreamento,
      deliveryTime: erp.deliveryTime,
    };

    this.comments = {
      store: store.status_history.filter((each) => {
        return each.comment != null && each.comment !== '[Intelipost Webhook] - ' && each.comment !== '[ERP - ECCOSYS] - ';
      }),
      erp: erp.observacaoInterna,
    };

    var count = 0;
    erp.items.forEach((i) => {
      count += global.Floa.def(i.quantidade);
    });
    this.totalPecas = count;

    this.eccoItensQuantity = erp.items.length;
    this.magentoItensQuantity = store.items.filter((each) => {
      return each.parent_item_id === null;
    }).length;
    return this;
  }
}

class SaleItemWrapper {
  constructor(item) {
    this.sku = item.codigo || item.sku;
    this.name = item.descricao || item.name;
    this.price = global.Floa.def(item.valor || item.price);
    this.discount = global.Floa.def(item.discount_amount || item.desconto_adm);
    this.total = global.Floa.def(item.price - (item.discount_amount / item.quantidade || item.discount_amount / item.qty_ordered) || item.valor);
    this.quantity = global.Num.def(item.quantidade || item.qty_ordered);
    this.weight = global.Floa.def(item.weight) < 1.0 ? global.Floa.def(item.weight) + 'g' : global.Floa.def(item.weight) + 'Kg';
    this.changed = item.observacao ? item.observacao.includes('changed') : false;
    this.store = item.store === true;
    this.erp = item.erp === true;
  }
}
