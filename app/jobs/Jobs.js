module.exports = {


  schedule: function(runNow) {
    var schedule = require('node-schedule');

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = new schedule.Range(1, 5);
    rule.minute = 12;

    var j = schedule.scheduleJob(rule, function() {
      runJobs();
    });

    if (runNow) {
      runJobs();
    } else {
      //No data found
      salesDb.findOne({}, function(err, doc) {
        if (!doc)
          runJobs();
      });
    }
  }
};

function runJobs() {
  //Update the local databse with the lasts sales order
  require('../jobs/JobSales.js').run(function() {
    //Handle the invoice by days
    require('../jobs/JobDays.js').run();
  });


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