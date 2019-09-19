var Query = require('../util/query.js');
var EccosysApi = require('../eccosys/eccosys-api.js');
const History = require('../bean/history.js');


//Situações dos pedidos
//-1 - Aguardando pagamento
//0  - Em aberto
//1  - Atendido
//2  - Cancelado
//3  - Pronto para picking
//4  - Pagamento em análise


var page_count = 100;

module.exports = class EccosysCalls{


  constructor(){
    this.call = new EccosysApi();
    this.query = new Query('$');
    this.pageCount(100);
  }

  setOnError(onError){
    this.call.setOnError(onError);

    return this;
  }

  pageCount(pageCount){
    this.page_count = pageCount;
    return this;
  }

  page(page){
    this.query.add('count', this.page_count);
    this.query.add('offset', this.page_count * page);
    return this;
  }

  dates(from, to, considerDate){
    if (considerDate){
      this.query.add('dataConsiderada', considerDate);
    }

    this.query.addDate('fromDate', from);
    this.query.addDate('toDate', to);

    return this;
  }

  order(order){
    this.query.add('order', order);
    return this;
  }

  active(){
    this.query.add('filter', 'situacao=A');
    return this;
  }


  getSale(number, callback) {
    if (number == undefined){
      callback({});
    }else{
      this.call.setPath('pedidos/' + number)
      .get((data)=>{
        data = JSON.parse(data);
        callback(typeof data == 'string' ? undefined : data[0]);
      });
    }
  }

  getSaleItems(number, callback) {
    this.call.setPath('pedidos/' + number + '/items')
    .get((data)=>{
      var items = JSON.parse(data);

      callback(typeof items === 'string' ? [] : items);
    });
  }


  getPickingSales(callback) {
    this.getSalesBySituation(3, callback);
  }

  getOpenSales(callback) {
    this.getSalesBySituation(0, callback);
  }

  getSalesBySituation(situation, callback) {
    //Pronto para picking
    this.call.setPath('pedidos/situacao/' + situation)
    .get((data)=>{
      callback(JSON.parse(data));
    });
  }

  getClient(id, callback) {
    this.call.setPath('clientes/' + id)
    .get((data)=>{
      callback(JSON.parse(data)[0]);
    });
  }

  getNfe(numeronf, callback) {
    this.call.setPath('notasfiscais/' + numeronf)
    .get((data)=>{
      callback(JSON.parse(data)[0]);
    });
  }


  getProducts(callback) {
    this.call.setPath('produtos' + this.query.build())
    .get((data)=>{
      callback(JSON.parse(data));
    });
  }


  getProduct(skuOrEan, callback) {
    this.call.setPath('produtos/' + (Num.isEan(skuOrEan) ? 'gtin=' + skuOrEan : skuOrEan))
    .get((data)=>{
      var parsed = JSON.parse(data);

      if (typeof parsed == 'string'){
        callback({error : parsed});
      }else{
        callback(parsed);
      }
    });
  }

  getSkusFromSale(sale, callback) {
    if(sale.items){
      var skus = sale.items.map((i)=>{
        return i ? i.codigo : '';
      });

      this.getSkus(skus, callback);
    }else{
      if (callback){
        callback([]);
      }
    }
  }

  getSkus(skus, callback, nullOnNotFound) {
    this.call.setPath('produtos/' + skus.join(';'))
    .get((data)=>{
      var parsed = JSON.parse(data);

      if (typeof parsed == 'string'){
        if (nullOnNotFound){
          callback(null);
        }else{
          throw parsed;
        }
      }else{
        //Se o resultado é 1
        if (!Array.isArray(parsed)){
          parsed = [parsed];
        }

        callback(parsed);
      }
    });
  }

  getStockHistory(sku, callback) {
    this.call.setPath('estoques/' + sku + '/registros' +  this.query.build())
    .get((rows)=>{
      callback(JSON.parse(rows));
    });
  }

  updateProduct(body, callback) {
    this.call.setPath('produtos').setBody(body).put((res)=>{
      callback(JSON.parse(res));
    });
  }

  updateProductStock(sku, body, callback) {
    this.call.setPath('estoques/' + sku).setBody(body).post((res)=>{
      callback(JSON.parse(res));
    });
  }

  updateSale(body, callback) {
    this.call.setPath('pedidos').setBody(body).put((sucess)=>{
      callback(sucess);
    });
  }

  packingPostNF(user, saleNumber, callback){
    this.call.setPath('nfes/' + saleNumber).setBody({}).withUser(user).post((res)=>{
      callback(res);
    });
  }

  resendRejectedNF(user, idNfe, callback){
    this.call.setPath('nfes/' + idNfe + '/autorizar').setBody({}).withUser(user).post((res)=>{
      callback(res);
    });
  }

  loadDanfe(res, nfNumber){
    this.call.setPath('danfes/' + nfNumber + '/pdf').download(res, nfNumber + '.pdf');
  }

  loadTransportTag(res, idNfe){
    this.call.setPath('etiquetas/' + idNfe).download(res, idNfe + '.pdf');
  }


  removeSaleItems(saleNumber, callback){
    this.call.setPath('pedidos/' + saleNumber + '/items').delete((res)=>{
      if (callback){
        callback(res);
      }
    });
  }

  insertSaleItems(saleNumber, items, callback){
    this.call.setPath('pedidos/' + saleNumber + '/items').setBody(items).post((res)=>{
      if (callback){
        callback(res);
      }
    });
  }


  updateSaleItems(saleNumber, items, callback){
    this.call.setPath('pedidos/items').setBody(items).put((res)=>{
      if (callback){
        callback(res);
      }
    });
  }


};
