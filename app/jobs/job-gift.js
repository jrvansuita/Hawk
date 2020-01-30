const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const GiftRule = require('../bean/gift-rule.js');
const SaleLoader = require('../loader/sale-loader.js');
const HistoryStorer = require('../history/history-storer.js');
const EmailBuilder = require('../email/builder/email-builder.js');

module.exports = class JobGift extends Job{

  onInitialize(){
    this.preparedItems = {};
    this.stocks = {};
    this.giftRulesList = [];
    this.itemObsTag = "gift";
    this.salesStatus = [];
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
        observacao: this.itemObsTag,
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

        var data = each.rules.find((e) => {
          return e.attr.includes("SITUATION");
        });

        if (data){
          this.salesStatus.push(data.val);
        }else{
          this.salesStatus.push("0");
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
            this.checkAndSendEmail(rule, sale, giftItem[0]);
          }
          callback();
        });
      }else{
        callback();
      }
    });
  }

  checkAndSendEmail(rule, sale, product){
    product.img = Params.skuImageUrl(product.codigo);

    if (rule.sendEmail){
      new EmailBuilder()
      .template('GIFT')
      .to(sale.client.email)
      .reply(Params.replayEmail())
      .setData({
        pedido: sale,
        cliente: sale.client,
        produto: product
      }).send();
    }
  }

  checkSaleHasAnyGiftItem(sale){
    return sale.items.some((item) => {
      return item.observacao.includes(this.itemObsTag);
    })
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

  checkMatchingAny(sale, callback){
    var allRules = Object.assign([], this.giftRulesList);

    var checkNext = () => {
      var rule = allRules[allRules.length -1];
      allRules.splice(-1,1);

      if (rule){
        if (this.checkMatching(rule, sale) && !this.checkSaleHasAnyGiftItem(sale)){
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
    .loadClient()
    .loadItems()
    .run((sale)=>{
      console.log('---- Pedido: ' + sale.numeroPedido + ' -----');
      this.checkMatchingAny(sale, callback);
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

  makeCall(status, callback){
    new EccosysProvider()
    .pageCount(100)
    .salesBySituation(status)
    .pagging()
    .each((sales, next)=>{
      console.log('----- ' + sales.length + ' Pedidos - Situacao ' + status + '------');
      if (callback){
        callback(sales, next);
      }
    }).end(()=>{
      if (callback){
        callback(null);
      }
    });
  }


  process(resolve){
    var current = -1;
    this.salesStatus = [...new Set(this.salesStatus)];

    var runEachStatus = () => {
      current++;
      var actual = this.salesStatus[current];

      if (actual){
        this.makeCall(actual, (sales, next) => {
          if (sales && (sales.length > 0) && this.whileHasRulesToWorkWith()){
            this.loadSalesPage(sales, next);
          }else{
            if (this.salesStatus[current+1]){
              runEachStatus();
            }else{
              this.endProcess();
            }
          }
        });
      }else{

      }
    };

    runEachStatus();
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      this.resolve = resolve;
      this.reject = reject;

      this.findRulesAndConsistencies(()=>{
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
