const Job = require('../jobs/controller/job.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');
const GiftRule = require('../bean/gift-rule.js');



module.exports = class JobGift extends Job{

  getName(){
    return 'Inclusão de Brinde no Pedido';
  }

  findRulesAndConsistencies(callback){
    GiftRule.findActives((err, all)=>{
      this.rules = all;
      this.stocks = {};

      this.rules.forEach((each)=>{
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

  checkMathing(rule, sale){
    rule.rules.forEach((eachRule) => {
      console.log(eachRule);
    });
  }

  process(){
    new EccosysProvider()
    .pageCount(1)
    .dates(Dat.yesterday().begin(), Dat.yesterday().end())
    .waitingPaymentSales()
    .pagging()
    .each((sales, next)=>{
      console.log('-----------');
      console.log('Carregou: ' + sales.length + ' pedidos');

      sales.forEach((sale) => {
        this.rules.forEach((rule) => {
          if (this.checkMathing(rule, sales)){
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
        //console.log(this.rules);
        //console.log(this.stocks);

        this.process();
      });
    });
  }


};
