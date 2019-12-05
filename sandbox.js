require('./app/abra-cadabra/first-step.js');



var pool = require('./app/jobs/controller/pool.js');
pool.initialize((jobs) => {
  var job = jobs.find((e) => {
    return e.tag == 'Mundipagg';
  })

  pool.fireJob(job);
});


//var JobMundiApi = require('./app/jobs/job-mundipagg-checker.js');
//var job = new JobMundiApi();
//job.doWork();






//const MagentoApi = require('./app/magento/magento-api.js');

/*new MagentoApi().instance((api) => {
  console.log(api.sessionId);
  console.log('conected');
});
*/


  /*magento.salesOrder.cancel({
    orderIncrementId: '120809479'
  }, (d) => {
    console.log(d);
  });*/



  /*magento.salesOrder.addComment({
    orderIncrementId: '120809479',
    status:           'canceled',
    comment:          'Teste',
    notify:           true
  }, (d) => {
    console.log(d);
  });*/
