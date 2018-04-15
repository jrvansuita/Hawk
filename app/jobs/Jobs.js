var schedule;

module.exports = {
  schedule: function(runNow) {
    schedule = require('node-schedule');

    getSchedules([11, 13, 17]).forEach((rule) => {
      schedule.scheduleJob(rule, function() {
        runJobs();
      });
    });

    if (runNow)
      runJobs();
  },

  run(onFinished) {
    runJobs(onFinished);
  }
};




function runJobs(onFinished) {
  if (global.jobsRunning) {
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
    rules.push(rule);
  });

  return rules;
}


// function teste() {
//   salesDb.find({
//     'billingDate': {
//       $gte: Dat.today().withoutTime(),
//       $lte: Dat.today().withoutTime()
//     }
//   }, function(err, docs) {
//     var s = '';
//     docs.forEach(function(item) {
//       s += item.number + ';' + item.value + '\n';
//     });
//
//     var fs = require('fs');
//     fs.writeFile(__dirname + "/test.csv", s, function(err) {
//       if (err) {
//         return console.log(err);
//       }
//
//       console.log("The file was saved!");
//     });
//   });
// }