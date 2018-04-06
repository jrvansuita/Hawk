require('./js/init/init.js');

var express = require('express');

var app = express();

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
      charts: charts
    });
  });
});


app.get('/invoice/by-date', (req, res) => {
  require('./js/builder/InvoiceChartBuilder.js').buildByDate(new Date(), new Date(), req.query.full !== undefined, function(charts) {
    res.render('invoice', {
      charts: charts
    });
  });
});


app.get('/outros', (req, res) => {
  res.render('outros');
});

app.get('/picking', (req, res) => {
  res.render('picking');
});

app.listen(3000);