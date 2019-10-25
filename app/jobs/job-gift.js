const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const GiftRule = require('../bean/gift-rule.js');



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

      console.log('[' + eachRule.attr + ',' + attrSaleName+ '] ' + eachRule.sign + ' ' + ruleValue);

      if (!conditionItem.match(saleValue, ruleValue)){
        return false;
      }
    }

    return true;
  }

  process(){
    new EccosysProvider()
    .pageCount(2)
    .dates(Dat.yesterday().begin(), Dat.yesterday().end())
    .waitingPaymentSales()
    .pagging()
    .each((sales, next)=>{
      console.log('-----------');
      console.log('Carregou: ' + sales.length + ' pedidos');

      sales.forEach((sale) => {
        console.log('Vai avaliar o pedido: ' + sale.numeroPedido);
        this.giftRulesList.forEach((giftRule) => {
          if (this.checkMatching(giftRule, sale)){
            console.log('adicinou');
          }
        });
      });

      //next();
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
