module.exports = {


  schedule: function(runNow) {
    var schedule = require('node-schedule');

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = new schedule.Range(1, 5);
    rule.minute = 12;

    var j = schedule.scheduleJob(rule, function() {
      runJobs();
    });

    if (runNow)
      runJobs();

  }
};

function runJobs() {
  //Update the local databse with the lasts sales order
  require('../jobs/JobSales.js').run(function() {
    //Handle the invoice by days
    require('../jobs/JobDays.js').run();
  });
}