require('./app/abra-cadabra/first-step.js');

const EccosysProvider = require('./app/eccosys_new/eccosys-provider.js');




new EccosysProvider()
.active()
.dates(new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date(), 'data')
.products().pagging((items, next)=>{
  console.log('-------------');
  items.forEach(e => {console.log(e.codigo);});
  setTimeout(next, 500);
});



//const JobProducts = require('./app/jobs_old/job-products.js');
//new JobProducts().run();


/*const GiftRule = require('./bean/gift-rule.js');

var giftRule = new GiftRule(1, 'Brinde Dia das Crianças', '0016az');

giftRule.add('Valor do Pedido', 'totalVenda', '>', 500);
giftRule.add('Desconto do Pedido', 'desconto', '<', 10);

new (require('./app/jobs/job-gift.js'))().run();
*/



//-------------------------



/*
require('./app/abra-cadabra/first-step.js');

const Job = require('./app/bean/job.js');

var rule = {
dayOfWeek : [0, 1,2,3,4,5],
hour: 19,
minute: 45
};

//new Job(1,'xml','Atualização de produtos para o feed xml','job-feed-xml-product', true, rule).upsert();


var rule2 = {
dayOfWeek : 0,
recurs: true,
hour: 20,
minute: 06
};

new Job(2,'Limpeza','Limpeza de histórico','job-history-cleaner', true, rule2).upsert();
*/
