const Params = require('../vars/params.js')
const File = require('../file/file.js')

module.exports = class ServerMidlewares {
  constructor (express) {
    this.express = express
    this.userLoader = require('../provider/user-provider.js')
  }

  attach () {
    this.defaultRoutes()
    this.wellcome()
    this.errors()
    this.routes()
  }

  defaultRoutes () {
    const routeStack = require('express').Router()

    // Generic Rules
    routeStack.use('*', this.getGenericRouteRule())

    // Api and Admin Rules
    routeStack.use('/admin/*', this.getAdminAuthRouteRule())
    routeStack.use('/api/*', this.getApiAuthRouteRule())

    // Web Backend Rules
    routeStack.get('*', this.getLoginRedirectRouteRule())
    routeStack.post('*', this.getPostCheckUserRouteRule())

    this.express.use(routeStack)
  }

  wellcome () {
    this.express.get(['/'], (req, res) => {
      if (req.session.lastpath && req.session.lastpath !== '/') {
        res.redirect(req.session.lastpath)
      } else {
        res.redirect('/wellcome')
      }
    })
  }

  getRoutes () {
    return new File('src/routes').getFolderFilesPaths('.js').filter((e) => { return !e.startsWith('_') })
  }

  routes () {
    this.getRoutes().forEach((file) => {
      var Clazz = require('../routes/' + file)

      new Clazz(this.express).attach()
    })
  }

  getAdminAuthRouteRule () {
    return (req, res, next) => {
      next('router')
    }
  }

  /**
    * @api {post} /* Authentication
    * @apiGroup Credentials
    * @apiDescription All api calls must have this parameters setted
    * @apiParam {String} access User access ID
    * @apiParam {String} pass User password
    * @apiParam {String} appkey App Key
   */

  getApiAuthRouteRule () {
    return (req, res, next) => {
      try {
        if (this.userLoader.checkUser(req.body.access, req.body.pass ?? '')) {
          if (!global.Arr.isIn(Params.apiAppKeys().split(','), req.body.appkey ?? '')) {
            global.Err.thrw('APIKEY')
          }
        }

        next('router')
      } catch {
        res.status(401).send({ error: 'Credenciais inválidas' })
      }
    }
  }

  getLoginRedirectRouteRule () {
    return (req, res, next) => {
      res.locals.loggedUser = req.session.loggedUser

      if (!global.Arr.isIn(global.skipLoginPaths, req.path)) {
        //        console.log('Auth')
        req.session.loggedUser = this.userLoader.getAndKeepLogged(req.session.loggedUserID)
        res.locals.loggedUser = req.session.loggedUser

        if (!res.locals.loggedUser) {
          req.session.loggedUserID = null

          res.redirect('/login')
        }
      }

      next('router')
    }
  }

  getPostCheckUserRouteRule () {
    return (req, res, next) => {
      if (req.session.loggedUserID) {
        next('router')
      } else {
        res.status(401).send({ error: 'Web Backend not logged' })
      }
    }
  }

  getGenericRouteRule (req, res, next) {
    return (req, res, next) => {
      console.log(`${req.method}: ${req.originalUrl}`)
      res.locals.query = req.query
      res.locals.url = req.originalUrl
      res.locals.path = req.baseUrl || req.path
      next()
    }
  }

  errors () {
    const History = require('../bean/history.js')
    process.on('uncaughtException', function (err) {
      console.log(err)
      if (err) {
        History.error(err)
      }
    })
  }
}
