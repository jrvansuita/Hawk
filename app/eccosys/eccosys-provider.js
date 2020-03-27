var EccosysApi = require('../eccosys/eccosys-api.js');

module.exports = class EccosysProvider extends EccosysApi{

  client(id) {
    return this.get('clientes/' + id).single();
  }

  clients() {
    return this.get('clientes').multiple();
  }

  sale(number) {
    return this.get('pedidos/' + number).single();
  }

  saleItems(number) {
    return this.get('pedidos/' + number + '/items').multiple();
  }

  pickingSales() {
    return this.salesBySituation(3);
  }

  openSales() {
    return this.salesBySituation(0);
  }

  waitingPaymentSales() {
    return this.salesBySituation(-1);
  }

  doneSales() {
    return this.salesBySituation(1);
  }

  salesBySituation(situation) {
    return this.param('$orderBy', 'data,ASC').get('pedidos/situacao/' + situation).multiple();
  }

  sales() {
    return this.get('pedidos').multiple();
  }

  nfe(numero) {
    return this.get('notasfiscais/' + numero).single();
  }

  shippingOrderList() {
    return this.param('$order', 'DESC').get('ordem-de-coleta').multiple();
  }

  shippingOrder(data) {
    return this.get('ordem-de-coleta/' + (data.id ? data.id : 'numero=' + data.number)).single();
  }

  products() {
    return this.get('produtos').multiple();
  }


  product(skuOrEan) {
    return this.get('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan)).single();
  }

  skus(skus) {
    return this.get('produtos/' + (Array.isArray(skus) ?  skus.join(';') : skus)).multiple();
  }

  stockHistory(sku) {
    return this.get('estoques/' + sku + '/registros').multiple();
  }

  danfe(res, nfNumber){
    this.download('danfes/' + nfNumber + '/pdf', res, nfNumber + '.pdf');
  }

  transportTag(res, idNfe){
    this.download('etiquetas/' + idNfe, res, idNfe + '.pdf');
  }

};
