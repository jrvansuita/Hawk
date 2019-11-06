const History = require('../../bean/history.js');

module.exports = class Job{

  constructor(jobSettings){
    this.jobSettings = jobSettings;
  }

  /**
  * Implementation optional
  */
  onInitialize(){

  }


  /**
  * Implementation required
  */
  getName() {
    throw new Error('You have to name your job!');
  }

  setOnStart(callback){
    this.onStartListener = callback;
    return this;
  }

  setOnTerminate(callback){
    this.onTerminateListener = callback;
    return this;
  }

  setOnError(callback){
    this.onErrorListener = callback;
    return this;
  }


  /**
  * Implementation optional
  */
  onStart() {
    console.log('[Job] onStart: ' + this.getName());

    History.job(this.getName(), this.jobSettings.description, this.jobSettings.tag);

    if (this.onStartListener){
      this.onStartListener();
    }
  }


  run(){
    this.onStart();
    this.onInitialize();

    this.doWork()
    .then((data)=>{
      this.onTerminate(data);
    }).catch(e =>{
      this.onError(e);
    });

    return this;
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
  onTerminate(data) {
    console.log('[Job] onTerminate: ' + this.getName());

    if (this.onTerminateListener){
      this.onTerminateListener(data);
    }
  }

  /**
  * Implementation optional
  */
  onError(e) {
    console.log('[Job] onError: ' + this.getName());


    if (this.onErrorListener){
      this.onErrorListener(e);
    }
  }

  getInfo(){
    return this.jobSettings;
  }

};
