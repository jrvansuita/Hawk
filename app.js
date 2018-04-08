require('./js/init/init.js');

var express = require('express');

var app = express();
app.set('port', process.env.PORT || 5000);

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));



// app.get('/', (req, res) => {
//   res.send('This is the home');
// });
//
// app.get('/home', (req, res) => {
//   res.sendFile(__dirname + '/views/home.html');
// });

app.get(['/', '/invoice', '/invoice/overview'], (req, res) => {
  require('./js/builder/InvoiceChartBuilder.js').buildOverview(req.query.full !== undefined, function(charts) {
    res.render('invoice', {
      charts: charts,
      page: req.originalUrl,
    });
  });
});


app.get('/invoice/by-date', (req, res) => {

  var from = req.query.from ? new Date(parseInt(req.query.from)) : Dat.firstDayOfMonth();
  var to = req.query.to ? new Date(parseInt(req.query.to)).maxTime() : Dat.lastDayOfMonth();

  require('./js/builder/InvoiceChartBuilder.js').buildByDate(from, to, req.query.full !== undefined, function(charts) {
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