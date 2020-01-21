
var app = global.app;
const Routes = require('../redirects/controller/routes.js');

//Keep a user variable for session in all ejs
//Redirect if no user is logged-in
const UsersProvider = require('../provider/user-provider.js');

app.use(function(req, res, next) {
  res.locals.loggedUser = {};
  res.locals.query = req.query;
  res.locals.url   = req.originalUrl;


  if (req.session.loggedUserID || Routes.checkIsPathNotLogged(req.path)) {
    if (req.session.loggedUserID != undefined){

      var user = UsersProvider.get(req.session.loggedUserID);

      if (UsersProvider.checkCanLogin(user)){
        res.locals.loggedUser = user;
      }else{
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
routes.push('general-routes.js');
routes.push('login-routes.js');
routes.push('jobs-routes.js');
routes.push('packing-routes.js');
routes.push('picking-routes.js');
routes.push('pending-routes.js');
routes.push('performance-routes.js');
routes.push('shipping-order-routes.js');
routes.push('history-routes.js');
routes.push('product-routes.js');
routes.push('user-routes.js');
routes.push('settings-routes.js');
routes.push('mock-routes.js');
routes.push('gift-routes.js');
routes.push('pictures-routes.js');

// -- Run Routes -- //
routes.forEach((r)=>{
  var Clazz = require('../redirects/' + r);
  new Clazz(app).attach();
});


//--- Keep History of Errors ---//

const History = require('../bean/history.js');

process.on('uncaughtException', function (err) {
  if(err){
    History.error(err);
  }
});
