require('./app/abra-cadabra/first-step.js');



new (require('./app/jobs/job-gift.js'))().doWork();




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
