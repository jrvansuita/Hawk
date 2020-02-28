const Job = require('../jobs/controller/job.js');


const History = require('../bean/history.js');

module.exports = class JobFeedXmlProducts extends Job{

  getName(){
    return 'Limpeza de histórico';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      var min = new Date();
      min.setMonth(min.getMonth() -1);

      var query = {date:{$lte: min}};

      History.removeAll(query, (err, doc) => {
        resolve();
      });
    });
  }


};
