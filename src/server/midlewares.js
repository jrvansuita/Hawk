const Params = require('../vars/params.js');
const File = require('../file/file.js');
const buffer = require('buffer/').Buffer;

module.exports = class ServerMidlewares {
  constructor(express) {
    this.express = express;
    this.userLoader = require('../provider/user-provider.js');
  }

  attach() {
    this.defaultRoutes();
    this.wellcome();
    this.errors();
    this.routes();
  }

  defaultRoutes() {
    const routeStack = require('express').Router();

    // Generic Rules
    routeStack.use('*', this.getGenericRouteRule());

    // Api and Market Rules
    routeStack.use('/market/*', this.getMarketAuthRouteRule());
    routeStack.use('/api/*', this.getApiAuthRouteRule());

    // Web Backend Rules
    routeStack.get('*', this.getLoginRedirectRouteRule());
    routeStack.post('*', this.getPostCheckUserRouteRule());

    this.express.use(routeStack);
  }

  wellcome() {
    this.express.get('/', (req, res) => {
      if (req.session.lastpath && req.session.lastpath !== '/') {
        res.redirect(req.session.lastpath);
      } else {
        res.redirect('/wellcome');
      }
    });
  }

  getRoutes() {
    return new File('src/routes').getFolderFilesPaths('.js').filter(e => {
      return !e.startsWith('_');
    });
  }

  routes() {
    this.getRoutes().forEach(file => {
      var Clazz = require('../routes/' + file);

      new Clazz(this.express).attach();
    });
  }

  getMarketAuthRouteRule() {
    return (req, res, next) => {
      console.log('Market');
      next('router');
    };
  }

  /**
   * @api {post} /* Authentication
   * @apiGroup Credentials
   * @apiDescription All api calls must have this parameters setted
   * @apiHeaderExample {json} Header-Example:
   *  {
   *   "access": "User Access ID"
   *   "pass": "User Password"
   *   "appkey": "App Key"
   * }
   */

  getApiAuthRouteRule() {
    return (req, res, next) => {
      try {
        req.headers.device = req.headers.device || 'api';

        if (this.userLoader.checkUser(req.headers.access, req.headers.pass ?? '')) {
          this._checkApiKeyCall(req);
        }

        next('router');
      } catch {
        res.status(401).send({ error: 'Credenciais inválidas' });
      }
    };
  }

  getLoginRedirectRouteRule() {
    return (req, res, next) => {
      res.locals.loggedUser = req.session.loggedUser;

      if (!global.Arr.isIn(global.skipLoginPaths, req.path)) {
        //        console.log('Auth')
        req.session.loggedUser = this.userLoader.getAndKeepLogged(req.session.loggedUserID);
        res.locals.loggedUser = req.session.loggedUser;

        if (!res.locals.loggedUser) {
          req.session.loggedUserID = null;

          res.redirect('/login');
        }
      }

      next('router');
    };
  }

  getPostCheckUserRouteRule() {
    return (req, res, next) => {
      if (req.session.loggedUserID || req.path === '/login') {
        res.locals.loggedUser = req.session.loggedUser;
        next('router');
      } else {
        res.status(401).send({ error: 'Web Backend not logged' });
      }
    };
  }

  getGenericRouteRule(req, res, next) {
    return (req, res, next) => {
      if (!process.env.IS_PRODUCTION) {
        console.log(`${req.method}: ${req.originalUrl}`);
      }

      //=this.printAllRoutes();

      res.locals.query = req.query;
      res.locals.url = req.originalUrl;
      res.locals.path = req.baseUrl || req.path;
      next();
    };
  }

  errors() {
    const History = require('../bean/history.js');
    process.on('uncaughtException', function (err) {
      console.log(err);
      if (err) {
        History.error(err);
      }
    });
  }

  _checkApiKeyCall(req) {
    var appKey = global.Arr.find(Params.apiAppKeys(), req.headers.appkey);

    if (appKey) {
      if (req.method !== 'GET') {
        if (global._apiWrites[req.baseUrl]) {
          var type = buffer.from(appKey, 'base64')?.toString('ascii')?.split('-')?.pop();
          if (!type.includes('W')) {
            global.Err.thrw('No Write Permission');
          }
        }
      }
    } else {
      global.Err.thrw('APIKEY not found');
    }
  }

  printAllRoutes() {
    var app = this.express;
    app._router.stack.forEach(function (r) {
      if (r.route && r.route.path) {
        console.log(r.route.stack[0].method + ': ' + r.route.path);
      }
    });
  }
};
