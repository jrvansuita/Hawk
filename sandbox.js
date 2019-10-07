require('./app/init/init.js');

//const JobProducts = require('./app/jobs/job-products.js');
//new JobProducts().run();


const GiftRule = require('./bean/gift-rule.js');

var giftRule = new GiftRule(1, 'Brinde Dia das Crianças', '0016az');

giftRule.add('Valor do Pedido', 'totalVenda', '>', 500);
giftRule.add('Desconto do Pedido', 'desconto', '<', 10);

new (require('./app/jobs/job-gift.js'))().run();
