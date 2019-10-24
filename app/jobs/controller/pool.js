const Jobs = require('../../bean/job.js');
const schedule = require('node-schedule');

global.jobsPoll = [];
var availableJobs = null;

module.exports = {

  get(id){
    return global.jobsPoll.find(each=>{return each.id == id;});
  },

  getAvailableJobs(){
    if (!availableJobs){
      var extension = ".js";
      var jobsFolder = require("path").join(__dirname, '..');
      let dir = require('fs').readdirSync(jobsFolder);
      var files = dir.filter( elm => elm.match(new RegExp(`.*\.(${extension})`, 'ig')));

      var result = {};


      files.forEach(e=>{
        var instance = new (require(jobsFolder + '/' + e))();
        result[e.replace('.js','')] = instance.getName();
      });

      availableJobs = result;
    }

    return availableJobs;
  },

  fireJob(job){
    var CurrentJob = require('../../jobs/' + job.type + '.js');
    new CurrentJob(job).start();
  },

  attach(job){

    var scheduleObject = schedule.scheduleJob(buildRecurrenceRule(job), (fireDate) => {
      this.fireJob(job);
    });

    job.schedule = scheduleObject;

    if (scheduleObject){
      console.log('[Job] Attachou: ' + job.description);
    }else{
      console.log('[Job] Não Attachou: ' + job.description);
    }

    console.log(job.rule);

    global.jobsPoll.push(job);
  },

  deattach(id){
    var job = this.get(id);

    if (job && job.schedule){
      job.schedule.cancel();
    }
  },

  initialize(){
    Jobs.findAll((error, jobs)=>{
      jobs.forEach((each)=>{
        this.attach(each.toObject());
      });
    });
  }

};

function buildRecurrenceRule(job){
  var rule = new schedule.RecurrenceRule();

  if (job.rule.dayOfWeek){
    rule.dayOfWeek = job.rule.dayOfWeek;
  }

  if (job.rule.date){
    rule.date = job.rule.date || null;
  }

  rule.hour = job.rule.hour;
  rule.minute = job.rule.minute;
  rule.second = 0;


  return rule;
}
