const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const GiftRule = require('../bean/gift-rule.js');
const SaleLoader = require('../loader/sale-loader.js');


module.exports = class JobGift extends Job{

  getName(){
    return 'Inclusão de Brinde no Pedido';
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
    for (var i = 0; i < rule.rules.length; i++) {
      var eachRule = rule.rules[i];

      //O que foi definido na regra
      var attrItem = GiftRule.attrs()[eachRule.attr];
      var conditionItem = GiftRule.conditions()[eachRule.sign];
      var ruleValue = eachRule.val;

      //O que tem no pedido
      var attrSaleName = attrItem ? attrItem.key :  eachRule.attr;
      var saleValue = sale[attrSaleName];

      console.log('---- Analizing ----');
      console.log('[' + eachRule.attr + ',' + attrSaleName+ ']');
      console.log(eachRule.sign);
      console.log(ruleValue);
      console.log('Value is: ' + saleValue);

      var matched = conditionItem.match(saleValue, ruleValue);




      if (!matched){
        console.log('Not Matched!');
        //return false;
      }else{
        console.log('Matched!');
      }
    }

    return true;
  }

  loadSaleAndProcess(s, callback){
    new SaleLoader(s)
    .loadClient()
    .loadItems()
    .run((sale)=>{
      console.log('---- Pedido: ' + sale.numeroPedido + ' -----');
      this.giftRulesList.forEach((giftRule) => {
        if (this.checkMatching(giftRule, sale)){
          console.log('adicinou');
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
    .pageCount(1)
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
