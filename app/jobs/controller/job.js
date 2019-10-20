const History = require('../../bean/history.js');

module.exports = class Job{

  constructor(jobSettings){
    this.jobSettings = jobSettings;
  }

  /**
  * Implementation required
  */
  getName() {
    throw new Error('You have to name your job!');
  }


  /**
  * Implementation optional
  */
  onStart() {
    console.log('[Job] onStart: ' + this.getName());

    History.job(this.getName(), this.jobSettings.description, this.jobSettings.tag);
  }


  start(){
    this.onStart();

    this.doWork()
    .then(()=>{
      this.onTerminate();
    }).catch(e =>{
      this.onError(e);
    });

  }

  /**
  * Implementation required
  */
  doWork() {
    console.log('[Job] doWork');
    //Returns a Promise
    throw new Error('You have to implement the method doWork!');
  }


  /**
  * Implementation optional
  */
  onTerminate() {
    console.log('[Job] onTerminate: ' + this.getName());
  }

  /**
  * Implementation optional
  */
  onError(e) {
    console.log('[Job] onError: ' + this.getName());
  }

};
