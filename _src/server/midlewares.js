
module.exports = class ServerMidlewares {
  constructor (express) {
    this.express = express
  }

  attach () {
    this.session()
    this.wellcome()
    this.errors()
    this.routes()
  }

  session () {
    const UsersProvider = require('../provider/user-provider.js')

    this.express.use(function (req, res, next) {
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
    })
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
