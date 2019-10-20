const Job = require('../jobs/controller/job.js');

module.exports = class JobTeste extends Job{

  getName(){
    return 'Testando!!';
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      resolve('Fez o trabalho');
    });
  }


};
