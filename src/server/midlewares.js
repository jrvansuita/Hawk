module.exports = class ServerMidlewares {
  constructor (express) {
    this.express = express
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

  getApiAuthRouteRule () {
    return (req, res, next) => {
      console.log('is api')
      next('router')
    }
  }

  getLoginRedirectRouteRule () {
    const UsersProvider = require('../provider/user-provider.js')

    return (req, res, next) => {
      console.log('is *')

      res.locals.loggedUser = {}
      res.locals.query = req.query
      res.locals.url = req.originalUrl

      if (req.session.loggedUserID || Arr.isIn(global.pathNotLogged, req.path)) {
        if (req.session.loggedUserID !== undefined) {
          var user = UsersProvider.get(req.session.loggedUserID)

          if (UsersProvider.checkCanLogin(user)) {
            res.locals.loggedUser = user
          } else {
            req.session.loggedUserID = null
          }
        }

        next()
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
