const Job = require('../jobs/controller/job.js');

module.exports = class JobTeste extends Job{

  getName(){
    return 'Logar o Nome da Tarefa';
  }

  doWork(){
    return new Promise((resolve, reject)=>{

      console.log('[Job] executou: ' + this.getInfo().description);

      resolve('Done!');
    });
  }


};
