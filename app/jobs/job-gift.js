const Job = require('../jobs/controller/job.js');


module.exports = class JobGift extends Job{

  getName(){
    return 'Inclusão de Brinde no Pedido';
  }

  doWork(){
    return new Promise((resolve, reject)=>{




      
      resolve('Done!');
    });
  }


};
