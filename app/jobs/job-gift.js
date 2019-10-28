const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const EccosysStorer = require('../eccosys_new/eccosys-storer.js');
const GiftRule = require('../bean/gift-rule.js');
const SaleLoader = require('../loader/sale-loader.js');
const HistoryStorer = require('../history/history-storer.js');

module.exports = class JobGift extends Job{

  constructor(){
    super();
    this.preparedItems = {};
    this.stocks = {};
    this.giftRulesList = [];
  }

  getName(){
    return 'Inclusão de Brinde no Pedido';
  }

  getAvaliableSkus(rule){
    for (var i = 0; i < rule.skus.length; i++) {
      var sku = rule.skus[i];
      var stock = this.stocks[sku];
      if (stock){
        if (stock > 0){
          this.stocks[sku]--;
          return sku;
        }
      }else{
        return sku;
      }
    }
  }

  loadPreparedGiftItem(rule, callback){
    var sku = this.getAvaliableSkus(rule);
    if (sku){
      if (this.preparedItems[sku]){
        callback(this.preparedItems[sku]);
      }else{
        new EccosysProvider().product(sku).go((product)=>{
          this.preparedItems[sku] = this.prepareGiftItem(product);
          callback(this.preparedItems[sku]);
        });
      }
    }else{
      callback(null);
    }
  }

  prepareGiftItem(product){
    if (product){
      return [{
        quantidade: 1,
        valor: 0,
        descricao: product.nome,
        precoLista: "0.00",
        descontoItem: "0.00",
        itemBonificacao: "S",
        valorComImpostos: "0.00",
        valorFrete: "0.00",
        observacao: "gift",
        gtin: product.gtin,
        idProduto: product.id,
        codigo: product.codigo
      }];
    }
  }

  removeNoStockGiftRules(){
    //Remove as gift rules que não possuem mais estoque
    this.giftRulesList = this.giftRulesList.filter((rule)=>{
      return !rule.checkStock || (rule.skus.every((sku) => {
        return this.stocks[sku] > 0;
      }));
    });
  }

  whileHasRulesToWorkWith(){
    return this.giftRulesList.length;
  }

  findRulesAndConsistencies(callback){
    GiftRule.findActives((err, all)=>{
      this.giftRulesList = all;

      //Coloca todos os skus com quantidade zero
      this.giftRulesList.forEach((each)=>{
        if (each.checkStock){
          each.skus.forEach((sku)=>{
            this.stocks[sku] = 0;
          });
        }
      });

      var skus = Object.keys(this.stocks);

      if (skus.length){
        //Carrega os produtos e as quantidades em estoque de cada sku
        new EccosysProvider().skus(skus).go((products)=>{
          products.forEach((product)=>{
            this.stocks[product.codigo] = product._Estoque.estoqueDisponivel;
          });

          this.removeNoStockGiftRules();
          callback();
        });
      }else{
        callback();
      }
    });
  }

  putGiftItemOnSale(sale, rule, callback){
    this.loadPreparedGiftItem(rule, (giftItem) => {
      if (giftItem.length){
        new EccosysStorer()
        .sale(sale.numeroPedido)
        .items()
        .insert(giftItem)
        .go((data) => {
          if(data.result.success.length){
            HistoryStorer.gift(sale.numeroPedido, giftItem[0].codigo, rule.name);
            console.log('Adicinou um brinde');
          }
          callback();
        });
      }else{
        callback();
      }
    });
  }


  checkMatching(rule, sale){
    for (var i = 0; i < rule.rules.length; i++) {
      var eachRule = rule.rules[i];
      //O que foi definido na regra
      var attrItem = GiftRule.attrs()[eachRule.attr];
      var conditionItem = GiftRule.conditions()[eachRule.sign];
      var ruleValue = eachRule.val;

      //O que tem no pedido
      var attrSaleName = attrItem ? attrItem.key :  eachRule.attr;
      var saleValue = sale[attrSaleName];


      //console.log('[' + eachRule.attr + ',' + attrSaleName+ '] ' + eachRule.sign + ' ' + ruleValue);

      var matched = conditionItem.match(saleValue, ruleValue);

      if (!matched){
        return false;
      }
    }

    return true;
  }

  checkMatchinAny(sale, callback){
    var allRules = Object.assign([], this.giftRulesList);

    var checkNext = () => {
      var rule = allRules[allRules.length -1];
      allRules.splice(-1,1);

      if (rule){
        if (this.checkMatching(rule, sale)){
          this.putGiftItemOnSale(sale, rule, checkNext);
        }else{
          checkNext();
        }
      }else{
        callback();
      }
    };

    checkNext();
  }

  loadEachSale(s, callback){
    new SaleLoader(s)
    //.loadClient()
    .loadItems()
    .run((sale)=>{
      console.log('---- Pedido: ' + sale.numeroPedido + ' -----');
      this.checkMatchinAny(sale, callback);
    });
  }

  loadSalesPage(sales, onTerminate){
    var index = -1;
    var eachSaleProcess = ()=>{
      var currentSale = sales[++index];

      if (currentSale && this.whileHasRulesToWorkWith()){
        this.loadEachSale(currentSale, eachSaleProcess);
      }else{
        onTerminate();
      }
    };

    eachSaleProcess();
  }




  process(resolve){
    new EccosysProvider()
    .pageCount(2)
    .dates(Dat.yesterday().begin(), Dat.yesterday().end())
    .sales()
    .pagging()
    .each((sales, next)=>{
      console.log('----- ' + sales.length + ' Pedidos ------');
      if ((sales.length > 0) && this.whileHasRulesToWorkWith()){
        this.loadSalesPage(sales, next);
      }else{
        this.endProcess();
      }
    }).end(()=>{
      this.endProcess();
    });
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      this.resolve = resolve;
      this.reject = reject;

      this.findRulesAndConsistencies(()=>{
        //console.log(this.giftRulesList);
        //console.log(this.stocks);
        if (this.whileHasRulesToWorkWith()){
          this.process();
        }else{
          this.endProcess();
        }
      });
    });
  }


  endProcess(){
    console.log('Terminou');
    this.resolve('Done!');
  }

};
