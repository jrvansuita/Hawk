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

app.use('/img', express.static('front/img'));
app.use('/front', express.static('front'));
app.use('/util', express.static('app/util'));


const ignorePaths = ['/login', '/', '.png', '.jpg'];

//Keep a user variable for session in all ejs
//Redirect if no user is logged-in
app.use(function(req, res, next) {
  if (req.session.loggedUser || req.path === '/login') {
    res.locals.loggedUser = req.session.loggedUser;

    if (Util.notIn(ignorePaths, req._parsedUrl.path)){
      req.session.lastpath = req._parsedUrl.path;
    }

    next();
  } else {
    res.redirect("/login");
  }
});


app.get(['/'], (req, res)=>{
  if (req.session.lastpath){
    res.redirect(req.session.lastpath);
  }else{
    res.redirect('/packing');
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

// -- Run Routes -- //
routes.forEach((r)=>{
  var Clazz = require('./app/redirects/' + r);
  new Clazz(app).attach();
});


app.listen(app.get('port'), function() {
  console.log('Node is running on port ', app.get('port'));
});
