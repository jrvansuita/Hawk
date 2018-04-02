module.exports = {


  schedule: function() {
    var schedule = require('node-schedule');

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = new schedule.Range(1, 5);
    rule.minute = 12;

    var j = schedule.scheduleJob(rule, function() {
      //Update the local databse with the lasts sales order
      require('../jobs/JobSales.js').run(function() {
        //Handle the invoice by days
        require('../jobs/JobDays.js').run();
      });
    });


  }
};