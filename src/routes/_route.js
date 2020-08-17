var _cors = {};
global._apiWrites = {};
global._marketAccess = { '/': true };

module.exports = class {
  constructor(app) {
    this.app = app;
  }

  mainPath() {
    return '';
  }

  page(path, callback) {
    return this.register('get', '', path, (req, ...params) => {
      callback(req, ...params);

      req.session.lastPath = req.path;
      console.log(req.session.lastPath);
    });
  }

  get(...params) {
    return this.register('get', '', ...params);
  }

  post(...params) {
    return this.register('post', '', ...params);
  }

  api(...params) {
    return this.apiWrite(...params);
  }

  apiWrite(...params) {
    return this.apiRead(...params).writeAccess();
  }

  apiRead(method, path, callback) {
    return this.register(method || this.lastMethod, '/api', path || this.lastPath, callback || this.lastCallBack, false, true);
  }

  market() {
    global._marketAccess[this.lastPath] = true;
    return this;
  }

  register(method, prefix, path, callback) {
    method = method || this.lastMethod;

    if (!prefix) {
      path = this.mainPath() + (path || '');
    }

    const fullPath = prefix + path || this.lastPath;

    this.app[method](fullPath, (req, res) => {
      Response.onTry(res, () => {
        this._applyCors(path, res);
        callback(req, res, req.body, res.locals, req.session);
      });
    });

    this.lastMethod = method;
    this.lastPath = path;
    this.lastCallBack = callback;

    return this;
  }

  skipLogin() {
    if (this.lastMethod === 'get') {
      global.skipLoginPaths = [].concat(global.skipLoginPaths, this.lastPath).filter(Boolean);
    }
    return this;
  }

  writeAccess() {
    global._apiWrites[this.lastPath] = true;
    return this;
  }

  cors() {
    _cors[this.lastPath] = true;
    return this;
  }

  _applyCors(path, res) {
    if (_cors[path]) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
  }

  _checkPermissionOrGoBack(req, res, settNum) {
    var user = res.locals.loggedUser;
    if (!global.Sett.get(user, settNum)) {
      res.redirect(req.session.lastPath);
      return false;
    }

    return true;
  }

  _resp() {
    return Response;
  }
};

const History = require('../bean/history.js');

var Response = {
  onTry(res, call) {
    try {
      call();
    } catch (e) {
      this.error(res, e);
    }
  },

  redirect(res) {
    return (response, error) => {
      this.onRedirect(res, response, error);
    };
  },

  onRedirect(res, r, e) {
    if (e) {
      this.error(res, e);
    } else {
      this.success(res, r);
    }
  },

  success(res, r) {
    if (typeof r === 'number') {
      r = r.toString();
    }

    res.status(200).send(r);
  },

  error(res, e) {
    var userId = res.locals.loggedUser ? res.locals.loggedUser.id : 0;
    History.handle(e, userId);

    res.status(500).send(e?.toString());
  },
};
