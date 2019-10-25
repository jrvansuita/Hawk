var EccosysApi = require('../eccosys_new/eccosys-api.js');

module.exports = class EccosysProvider extends EccosysApi{

  client(id) {
    return this.get('clientes/' + id).single();
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

  salesBySituation(situation) {
    return this.get('pedidos/situacao/' + situation).multiple();
  }

  nfe(numero) {
    return this.get('notasfiscais/' + numero).single();
  }

  products() {
    return this.get('produtos').multiple();
  }


  product(skuOrEan) {
    return this.get('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan)).single();
  }

  skus(skus) {
    return this.get('produtos/' + skus.join(';')).multiple();
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
