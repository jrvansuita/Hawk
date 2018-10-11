const schedule = require('node-schedule');
const History = require('../../bean/history.js');

module.exports = class Controller {
  constructor(){
    this.checkActive();
  }

  run() {
    throw new Error("Method 'run()' must be implemented.");
  }

  internalRun(){
    console.log('Iniciou Job');

    if (!this.isRunning()){
      this.start();
      this.run();
    }
  }

  isRunning(){
    return global.jobsRunning;
  }

  checkActive(){
    if (this.isRunning()){
      var msg = 'Já existe um job ativo no momento.';
      History.error(msg);
      throw msg;
    }
  }

  start(){
    this.checkActive();
    global.jobsRunning = true;
  }

  terminate(){
    global.jobsRunning = false;
  }

  schedule(hours){
    _build(hours).forEach((rule) => {
      console.log('Job agendado para '+ rule.hour + ":" + rule.minute);
      schedule.scheduleJob(rule, (fireDate) => {
        this.internalRun();
      });
    });
  }
};


function _build(hours) {
  var rules = [];

  if (hours != undefined){
    if (typeof hours != Array){
      hours = [hours];
    }

    hours.forEach((hour) => {
      var rule = new schedule.RecurrenceRule();
      //Monday to Friday
      rule.dayOfWeek = new schedule.Range(1, 5);

      //All week
      //rule.dayOfWeek = new schedule.Range(0, 6);

      var time = parseFloat(hour.toString().replace(',','.')).toString().split('.');

      rule.hour = Num.def(time[0]);
      rule.minute = Num.def(time[1].length < 2 ? time[1] + '0' : time[1]);
      rules.push(rule);
    });
  }

  return rules;
}
