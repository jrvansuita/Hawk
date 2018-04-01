require('./js/init/init.js');

var express = require('express');

var app = express();

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));

//require('./js/jobs/JobDays.js').run();

// app.get('/', (req, res) => {
//   res.send('This is the home');
// });
//
// app.get('/home', (req, res) => {
//   res.sendFile(__dirname + '/views/home.html');
// });

app.get('/invoice', (req, res) => {

  require('./js/builder/InvoiceChartBuilder.js').getLastMonth(function(chart) {
    res.render('invoice', {
      chart: chart
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