const Params = require('../vars/params.js')

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

    routeStack.use('/admin/*', this.getAdminAuthRouteRule())
    routeStack.use('/api/*', this.getApiAuthRouteRule())
    routeStack.use('*', this.getLoginRedirectRouteRule())

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
    var routes = []
    routes.push('general-routes.js')
    routes.push('login-routes.js')
    routes.push('jobs-routes.js')
    routes.push('packing-routes.js')
    routes.push('picking-routes.js')
    routes.push('pending-routes.js')
    routes.push('performance-routes.js')
    routes.push('shipping-order-routes.js')
    routes.push('history-routes.js')
    routes.push('product-routes.js')
    routes.push('user-routes.js')
    routes.push('settings-routes.js')
    routes.push('mock-routes.js')
    routes.push('gift-routes.js')
    routes.push('pictures-routes.js')
    routes.push('template-routes.js')
    routes.push('images-routes.js')
    routes.push('customer-routes.js')
    routes.push('enumerator-routes.js')
    return routes
  }

  routes () {
    this.getRoutes().forEach((r) => {
      var Clazz = require('../routes/' + r)

      new Clazz(this.express).attach()
    })
  }

  getAdminAuthRouteRule () {
    return (req, res, next) => {
      console.log('is admin')
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
          if (!Arr.isIn(Params.apiAppKeys().split(','), req.body.appkey ?? '')) {
            Err.thrw('APIKEY')
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
      res.locals.loggedUser = {}
      res.locals.query = req.query
      res.locals.url = req.originalUrl

      if (req.session.loggedUserID || Arr.isIn(global.pathNotLogged, res.locals.url)) {
        if (req.session.loggedUserID !== undefined) {
          var user = this.userLoader.get(req.session.loggedUserID)

          if (this.userLoader.checkCanLogin(user)) {
            res.locals.loggedUser = user
          } else {
            req.session.loggedUserID = null
          }
        }

        next('router')
      } else {
        res.redirect('/login')
      }
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
