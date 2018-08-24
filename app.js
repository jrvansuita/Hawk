require('./app/init/init.js');

var cookieSession = require('cookie-session');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '5mb',
  parameterLimit: 1000000
}));

// register the session with it's secret ID
app.use(cookieSession({
  name: 'hawk-session',
  secret: process.env.SESSION_SECRET || 'secret',

  // Cookie Options
  maxAge: 30 /*30 dias*/ * (24 * 60 * 60 * 1000) // 24 hours
}));

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/visual', express.static('visual'));
app.use('/control', express.static('control'));
app.use('/util', express.static('app/util'));
app.use('/libs', express.static('libs'));

app.use('/chart', express.static('views/chart'));


// app.get('/', (req, res) => {
//   res.send('This is the home');
// });
//
// app.get('/home', (req, res) => {
//   res.sendFile(__dirname + '/views/home.html');
// });


app.post('/run-jobs', (req, res) => {
  var jobsRunner = require('./app/jobs/Jobs.js');

  var dataResult = {
    "was_running": true
  };

  if (req.headers.referer.includes('packing')){
    jobsRunner.runPacking((runned) => {
      dataResult.was_running = runned;

      if (runned) {
        res.status(200).send(dataResult);
      } else {
        res.status(201).send(dataResult);
      }
    });
  }else{
    jobsRunner.runPicking(()=>{
      res.status(200).send(dataResult);
    });
  }

});

//Keep a user variable for session in all ejs
//Redirect if no user is logged-in
app.use(function(req, res, next) {
  if (req.session.loggedUser || req.path === '/login') {
    res.locals.loggedUser = req.session.loggedUser;
    next();
  } else {
    res.redirect("/login");
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', function(req, res) {
  var UsersProvider = require('./app/provider/UsersProvider.js');
  UsersProvider.login(req.body.userId, req.body.userAccess, (user, msg)=>{
    req.session.loggedUser = user;

    if (req.session.loggedUser) {
      res.status(200).send(req.session.loggedUser);
    } else {
      req.session = null;
      res.status(505).send(msg);
    }
  });
});

app.get(['/', '/packing', '/packing/overview'], (req, res) => {
  require('./app/builder/InvoiceChartBuilder.js').buildOverview(res.locals.loggedUser.full, function(charts) {
    res.render('invoice-chart', {
      charts: charts,
      page: req.originalUrl,
    });
  });
});


app.get('/packing/by-date', (req, res) => {
  var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
  var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();

  require('./app/builder/InvoiceChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
    res.render('invoice-chart', {
      charts: charts,
      page: req.originalUrl,
      showCalendarFilter : true
    });
  });
});



app.get('/packing/achievements', (req, res) => {
  var InvoiceAchievGridBuilder = require('./app/builder/InvoiceAchievGridBuilder.js');
  var builder = new InvoiceAchievGridBuilder();
  builder.init(res.locals.loggedUser.full,
    (data) => {
      res.render('invoice-achiev', {
        data: data
      });
    });

    builder.build();
  });

  app.get('/picking/achievements', (req, res) => {
    var PickingAchievGridBuilder = require('./app/builder/PickingAchievGridBuilder.js');
    var builder = new PickingAchievGridBuilder();
    builder.init(res.locals.loggedUser.full,
      (data) => {
        res.render('picking-achiev', {
          data: data
        });
      });

      builder.build();
    });

    app.get('/estoque', (req, res) => {
      res.render('estoque');
    });





    // --- Picking --- //
    var pickingProvider = new require('./app/provider/PickingProvider.js');

    app.get('/picking', (req, res) => {

      pickingProvider.init(req.query.transp,() => {


        if (!res.headersSent){
          res.render('picking', {
            upcoming: pickingProvider.upcomingSales(),
            remaining: pickingProvider.remainingSales(),
            inprogress: pickingProvider.inprogressPicking(),
            transportList: pickingProvider.getTransportList(),
            pendingSales: pickingProvider.pendingSales(),
            donePickings: pickingProvider.donePickings(),
            blockedSales: pickingProvider.blockedPickings(),
            selectedTransp: req.query.transp,
            printPickingUrl: global.pickingPrintUrl
          });
        }
      });
    });

    app.get(['/pending'], (req, res) => {
      pickingProvider.onPending(()=>{
        res.render('pending',{
          wideOpen : true,
          pendingSales: pickingProvider.pendingSales()});
      });
    });


    app.get('/picking-sale', (req, res) => {
      try {
        pickingProvider.handle(req.query.userid, (result) => {
          res.status(200).send(result);
        });
      } catch (e) {
        console.log(e);
        res.status(412).send(e);
      }
    });

    app.post('/picking-pending', (req, res) => {
      try {
        pickingProvider.storePendingSale(req.body.pendingSale, req.body.local, (printUrl) => {
          res.status(200).send(printUrl);
        });
      } catch (e) {
        console.log(e.message);
        res.status(500).send(new Error(e.message));
      }
    });

    app.post('/picking-pending-solving', (req, res) => {
      try {
        pickingProvider.solvingPendingSale(req.body.pendingSale, (err, result) => {
          if (err){
            res.status(500).send(err);
          }else{
            res.status(200).send(result);
          }
        });
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    });

    app.post('/picking-pending-solved', (req, res) => {
      try {
        pickingProvider.solvedPendingSale(req.body.pendingSale, (result) => {
          res.status(200).send(result);
        });
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    });


    app.post('/picking-pending-restart', (req, res) => {
      try {
        pickingProvider.restartPendingSale(req.body.pendingSale, (printUrl) => {
          res.status(200).send(printUrl);
        });
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    });

    app.post('/picking-done-restart', (req, res) => {
      try {
        pickingProvider.restartDoneSale(req.session.loggedUser, req.body.sale, (result) => {
          res.status(200).send(result);
        });
      } catch (e) {
        res.status(500).send(e);
      }
    });

    app.get(['/picking/overview'], (req, res) => {
      require('./app/builder/PickingChartBuilder.js').buildOverview(res.locals.loggedUser.full, function(charts) {
        res.render('picking-chart', {
          charts: charts,
          page: req.originalUrl,
        });
      });
    });


    app.get(['/picking/by-date'], (req, res) => {
      var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
      var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();

      require('./app/builder/PickingChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
        res.render('picking-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter : true
        });
      });
    });

  app.get(['/profile/performance'], (req, res) => {
   var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
   var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();
   var userId = req.query.userid || req.session.loggedUser.id;

   require('./app/provider/ProfilePerformanceProvider.js').onUserPerformance(from, to, userId, function(user, charts) {
     res.render('profile-performance', {
       user: user,
       charts: charts,
       showCalendarFilter : true,
       hideEmptyCharts : true
     });
   });
  });


  app.post(['/picking/toggle-block-sale'], (req, res) => {
    try {

      pickingProvider.toggleBlockedSale(req.body.saleNumber, req.session.loggedUser, (result) => {
        res.status(200).send(result);
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  });




    app.listen(app.get('port'), function() {
      console.log('Node is running on port ', app.get('port'));
    });
