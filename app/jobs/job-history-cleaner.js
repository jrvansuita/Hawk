const Job = require('../jobs/controller/job.js');


const History = require('../bean/history.js');

module.exports = class JobFeedXmlProducts extends Job{

  getName(){
    return 'Limpeza de histórico';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      //Delete History before 2 months
      var min = new Date();
      min.setMonth(c.getMonth() -2);

      History.remove({'date':{'$lt': min}});
    });
  }


};
