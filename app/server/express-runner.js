//Starts Express Server Framework

var cookieSession = require('cookie-session');
var express = require('express');
var bodyParser = require('body-parser');

global.app = express();
var app = global.app;

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '5mb',
  parameterLimit: 1000000
}));



// register the session with it's secret ID
app.use(cookieSession({
  name: 'hawk-session',
  secret: 'HAWK-SES',

  // Cookie Options
  maxAge: 30 /*30 dias*/ * (24 * 60 * 60 * 1000) // 24 hours
}));

app.set('view engine', 'ejs');
app.set('views', global.__appDir + '/views');
app.listen().setTimeout(120000); // 2 minutos

var staticOptions = {};

if (process.env.NODE_ENV){
  //Desligado o cache nos staticos
  //  staticOptions = { maxAge: 86400000*1 }; // 1 days
}


app.use('/img', express.static('front/img', staticOptions));
app.use('/front', express.static('front', staticOptions));
app.use('/util', express.static('app/util', staticOptions));
app.use('/param', express.static('app/param/get.js', staticOptions));


var server = app.listen(app.get('port'), function() {
  //('Node is running on port ', app.get('port'));
});



//--- Socket IO for sending messages like Nf-e (Long Request) ---//

global.io = require('socket.io')(server);
