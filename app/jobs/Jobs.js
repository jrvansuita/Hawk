var schedule;
var lastPickingRunned = 0;

module.exports = {
  schedule: function(runNow) {
    schedule = require('node-schedule');

    // var rule = new schedule.RecurrenceRule();
    // rule.dayOfWeek = new schedule.Range(1, 5);
    // rule.hour = 11;
    //
    // var j = schedule.scheduleJob(rule, function(fireDate) {
    //   console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
    // });


    getSchedules([11, 13, 17]).forEach((rule) => {
      schedule.scheduleJob(rule, function(fireDate) {
        console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
        runJobsPacking();
      });
    });

    if (runNow)
      runJobsPacking();
  },

  runPacking(onFinished) {
    runJobsPacking(onFinished);
  },

  runPicking(onFinished) {
    var now = new Date().getTime();

    if ((global.staticPickingList.length == 0) || (lastPickingRunned + 3600000) < now){
      lastPickingRunned = now;
      global.staticPickingList = [];
    }else{
      console.log('Picking refreshed to frequently.');
    }

    onFinished();
  }

};




function runJobsPacking(onFinished) {
  if (global.jobsRunning) {
    if (onFinished)
      onFinished(false);
  } else {
    global.jobsRunning = true;

    var SaleJob = require('../jobs/JobSales.js');
    //Update the local databse with the lasts sales order
    SaleJob.run(function() {
      //Handle the Packing by days
      require('../jobs/JobDays.js').run(() => {
        global.jobsRunning = false;

        SaleJob.clear();

        if (onFinished)
          onFinished(true);
      });
    });


  }
}

function getSchedules(hours) {
  var rules = [];
  hours.forEach((hour) => {
    var rule = new schedule.RecurrenceRule();
    //Monday to Friday
    rule.dayOfWeek = new schedule.Range(1, 5);
    rule.hour = hour;
    rule.minute = 0;
    rules.push(rule);
  });

  return rules;
}
