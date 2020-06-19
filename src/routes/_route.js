
module.exports = class {
  constructor (app) {
    this.app = app
  }

  _page (paths, callback) {
    return this._register('get', paths, (req, ...params) => {
      callback(req, ...params)
      req.session.lastpath = paths instanceof Array ? paths[0] : paths
    })
  }

  _get (...params) {
    return this._register('get', ...params)
  }

  _post (...params) {
    return this._register('post', ...params)
  }

  _api (method, paths, callback) {
    return this._register(method || this.lastMethod, [].concat(paths || this.lastPaths).map((e) => { return '/api' + e }), callback || this.lastCallBack, false, true)
  }

  _register (method, paths, callback, pathNotLogged, enableCors) {
    method = method || this.lastMethod
    paths = paths || this.lastPaths

    if (pathNotLogged) {
      this.addNotLoggedNeeded(paths)
    }

    this.app[method](paths, (req, res) => {
      Response.onTry(res, () => {
        if (enableCors) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        }

        callback(req, res, req.body, res.locals, req.session)
      })
    })

    this.lastMethod = method
    this.lastPaths = paths
    this.lastCallBack = callback

    return this
  }

  _checkPermissionOrGoBack (req, res, settNum) {
    var user = res.locals.loggedUser
    if (!Sett.get(user, settNum)) {
      res.redirect(req.session.lastpath)
      return false
    }

    return true
  }

  _resp () {
    return Response
  }

  addNotLoggedNeeded (path) {
    this.createNotLogged()

    global.pathNotLogged.push(path)
  }

  createNotLogged () {
    if (!global.pathNotLogged) {
      global.pathNotLogged = []
    }
  }
}

const History = require('../bean/history.js')

var Response = {

  onTry (res, call) {
    try {
      call()
    } catch (e) {
      this.error(res, e)
    }
  },

  redirect (res) {
    return (response, error) => {
      this.onRedirect(res, response, error)
    }
  },

  onRedirect (res, r, e) {
    if (e != undefined) {
      this.error(res, e)
    } else {
      this.sucess(res, r)
    }
  },

  sucess (res, r) {
    if (typeof r === 'number') {
      r = r.toString()
    }

    res.status(200).send(r)
  },

  error (res, e) {
    console.log('Printing error: ' + e.toString())

    var userId = res.locals.loggedUser ? res.locals.loggedUser.id : 0
    History.handle(e, userId)

    res.status(500).send(e.toString())
  }
}
