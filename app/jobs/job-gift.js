const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const EccosysStorer = require('../eccosys_new/eccosys-storer.js');
const GiftRule = require('../bean/gift-rule.js');
const SaleLoader = require('../loader/sale-loader.js');


module.exports = class JobGift extends Job{

  getName(){
    return 'Inclusão de Brinde no Pedido';
  }

  getAvaliableSkus(rule){
    rule.skus.forEach((each) => {
      var stock = this.stocks[each];
      if (stock){
        if (stock > 0){
          this.stocks[each]--;
          return each;
        }
      }else{
        return each;
      }
    });
  }

  getGiftItem(rule){
    var sku = this.getAvaliableSkus(rule);
    if (sku){
      return [{
        quantidade: 1,
        valor: 0,
        //"descricao": "Conjunto Infantil Summer Branco - Pugg-4",
        //"base_comissao": "15.90",
        //"alq_comissao": "0.00",
        //"vlr_comissao": "0.00",
        "precoLista": "15.9000000000",
        "descontoItem": "0.00",
        //"codigoCupom": null,
        //"unidadeCupom": null,
        //"ipptCupom": null,
        //"itemCanceladoCupom": null,
        //"numItemCupom": null,
        itemBonificacao: "S",
        //"valorComImpostos": "0.0000000000",
        //"valorFrete": "0.00",
        "observacao": "gift",
        //"gtin": "7891000640043",
        codigo: sku
      }];
    }
  }

  findRulesAndConsistencies(callback){
    GiftRule.findActives((err, all)=>{
      this.giftRulesList = all;
      this.stocks = {};

      this.giftRulesList.forEach((each)=>{
        if (each.checkStock){
          each.skus.forEach((sku)=>{
            this.stocks[sku] = 0;
          });
        }
      });

      var skus = Object.keys(this.stocks);

      if (skus.length){
        new EccosysProvider().skus(skus).go((products)=>{
          products.forEach((product)=>{
            this.stocks[product.codigo] = product._Estoque.estoqueDisponivel;
          });

          callback();
        });
      }else{
        callback();
      }
    });
  }


  checkMatching(rule, sale){
    console.log('---- Rule: '+rule.name+' ----');
    for (var i = 0; i < rule.rules.length; i++) {
      var eachRule = rule.rules[i];
      //O que foi definido na regra
      var attrItem = GiftRule.attrs()[eachRule.attr];
      var conditionItem = GiftRule.conditions()[eachRule.sign];
      var ruleValue = eachRule.val;

      //O que tem no pedido
      var attrSaleName = attrItem ? attrItem.key :  eachRule.attr;
      var saleValue = sale[attrSaleName];


      console.log('[' + eachRule.attr + ',' + attrSaleName+ ']');
      console.log(eachRule.sign);
      console.log(ruleValue);
      console.log('Value is: ' + saleValue);

      var matched = conditionItem.match(saleValue, ruleValue);

      if (!matched){
        console.log('Not Matched!');
        return false;
      }else{
        console.log('Matched!');
      }

      console.log('------------------');
    }

    return true;
  }

  loadSaleAndProcess(s, callback){
    new SaleLoader(s)
    //.loadClient()
    .loadItems()
    .run((sale)=>{
      console.log('---- Pedido: ' + sale.numeroPedido + ' -----');
      this.giftRulesList.forEach((giftRule) => {
        if (this.checkMatching(giftRule, sale)){

          var giftItem = this.getGiftItem(giftRule);

          if (giftItem){
            new EccosysStorer()
            .sale(sale.numeroPedido)
            .items()
            .insert(giftItem)
            .go((data) => {
              console.log(data);
              console.log('Inseriu o gift');
            });
          }
        }
      });

      callback();
    });
  }

  loadSalesPage(sales, onTerminate){
    var index = -1;
    var eachSaleProcess = ()=>{
      var currentSale = sales[++index];

      if (currentSale){
        this.loadSaleAndProcess(currentSale, eachSaleProcess);
      }else{
        if (onTerminate){
          onTerminate();
        }
      }
    };

    eachSaleProcess();
  }

  process(){
    new EccosysProvider()
    .pageCount(100)
    .dates(Dat.yesterday().begin(), Dat.yesterday().end())
    .waitingPaymentSales()
    .pagging()
    .each((sales, next)=>{
      //Provisório
      next = () => {

      };
      //Provisório


      console.log('-----------');
      console.log('Carregou: ' + sales.length + ' pedidos');
      if (sales.length > 0){
        this.loadSalesPage(sales, next);
      }else{
        next();
      }
    }).end(()=>{
      console.log('Terminou');
      resolve('Done!');
    });
  }

  doWork(){
    return new Promise((resolve, reject)=>{

      this.findRulesAndConsistencies(()=>{
        //console.log(this.giftRulesList);
        //console.log(this.stocks);

        this.process();
      });
    });
  }


};
