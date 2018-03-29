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
  require('./js/provider/InvoicesProvider.js').get(new Date(), new Date(), function(data) {
    res.render('invoice', {
      data: data
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