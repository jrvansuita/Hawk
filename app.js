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
app.set('views', __dirname + '/views');

var staticOptions = {};

if (process.env.NODE_ENV){
  //Desligado o cache nos staticos
  //  staticOptions = { maxAge: 86400000*1 }; // 1 days
}


app.use('/img', express.static('front/img', staticOptions));
app.use('/front', express.static('front', staticOptions));
app.use('/util', express.static('app/util', staticOptions));


var server = app.listen();
server.setTimeout(120000); // 2 minutos

const Routes = require('./app/redirects/controller/routes.js');

//Keep a user variable for session in all ejs
//Redirect if no user is logged-in
const UsersProvider = require('./app/provider/UsersProvider.js');

app.use(function(req, res, next) {
  res.locals.loggedUser = {};

  if (req.session.loggedUserID || Routes.checkIsPathNotLogged(req.path)) {
    if (req.session.loggedUserID != undefined){
      res.locals.loggedUser = UsersProvider.get(req.session.loggedUserID);

      if (res.locals.loggedUser && !res.locals.loggedUser.active){
        req.session.loggedUserID = null;
      }
    }

    next();
  } else {
    res.redirect("/login");
  }
});


app.get(['/'], (req, res)=>{
  if (req.session.lastpath && req.session.lastpath != '/'){
    res.redirect(req.session.lastpath);
  }else{
    res.redirect('/wellcome');
  }
});

var routes = [];
routes.push('login-routes.js');
routes.push('jobs-routes.js');
routes.push('packing-routes.js');
routes.push('picking-routes.js');
routes.push('pending-routes.js');
routes.push('performance-routes.js');
routes.push('history-routes.js');
routes.push('stock-routes.js');
routes.push('user-routes.js');
routes.push('settings-routes.js');

// -- Run Routes -- //
routes.forEach((r)=>{
  var Clazz = require('./app/redirects/' + r);
  new Clazz(app).attach();
});


var server = app.listen(app.get('port'), function() {
  //('Node is running on port ', app.get('port'));
});


//--- Socket IO for sending messages like Nf-e (Long Request) ---//

global.io = require('socket.io')(server);


//--- Keep History of Errors ---//

const History = require('./app/bean/history.js');

process.on('uncaughtException', function (err) {
  if(err){
    History.error(err);
  }
});
