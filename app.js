require('./app/init/init.js');

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// register the session with it's secret ID
app.use(session({
  secret: "hawk",
  name: "hawk_cookie",
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/visual', express.static('visual'));
app.use('/control', express.static('control'));
app.use('/libs', express.static('libs'));


// app.get('/', (req, res) => {
//   res.send('This is the home');
// });
//
// app.get('/home', (req, res) => {
//   res.sendFile(__dirname + '/views/home.html');
// });



//Keep a user variable for session in all ejs
app.use(function(req, res, next) {
  if (req.session.user || req.path === '/login') {
    res.locals.user = req.session.user;
    next();
  } else {
    res.redirect("/login");
  }
});

app.post('/run-jobs', (req, res) => {
  require('./app/jobs/Jobs.js').run((runned) => {
    var result = {
      "was_running": runned
    };

    if (runned) {
      res.status(200).send(result);
    } else {
      res.status(201).send(result);
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', function(req, res) {
  req.session.user = require('./app/provider/UsersProvider.js').get(req.body.userid);
  console.log(req.session.user);

  if (req.session.user) {
    res.status(200).send(req.session.user);
  } else {
    res.status(505).send(null);
  }
});

app.get(['/', '/invoice', '/invoice/overview'], (req, res) => {
  require('./app/builder/InvoiceChartBuilder.js').buildOverview(req.query.full !== undefined, function(charts) {
    res.render('invoice', {
      charts: charts,
      page: req.originalUrl,
    });
  });
});


app.get('/invoice/by-date', (req, res) => {
  var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
  var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();

  require('./app/builder/InvoiceChartBuilder.js').buildByDate(from, to, req.query.full !== undefined, function(charts) {
    res.render('invoice', {
      charts: charts,
      page: req.originalUrl,
    });
  });
});


app.get('/outros', (req, res) => {
  res.render('outros');
});

app.get('/picking', (req, res) => {
  res.render('picking');
});


app.listen(app.get('port'), function() {
  console.log('Node is running on port ', app.get('port'));
});