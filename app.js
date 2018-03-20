var express = require('express');

var app = express();

app.set('view engine', 'ejs');

var Job = require('./js/jobs/Job.js');


app.get('/', (req, res) => {

  Job.sync();
  res.send('This is the home');
});

app.listen(3000);