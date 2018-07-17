var schedule;

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
        runJobsInvoice();
      });
    });

    if (runNow)
      runJobsInvoice();
  },

  runInvoice(onFinished) {
    runJobsInvoice(onFinished);
  },

  runPicking(onFinished) {
    global.staticPickingList = [];
    onFinished();
  }

};




function runJobsInvoice(onFinished) {
  if (global.jobsRunning) {
    if (onFinished)
      onFinished(false);
  } else {
    global.jobsRunning = true;

    var SaleJob = require('../jobs/JobSales.js');
    //Update the local databse with the lasts sales order
    SaleJob.run(function() {
      //Handle the invoice by days
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
