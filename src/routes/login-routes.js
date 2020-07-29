const Routes = require('./_route.js')
const UsersProvider = require('../provider/user-provider.js')
const User = require('../bean/user.js')
const CustomerPasswordEmail = require('../customer/password-email/password-forget-email.js')

module.exports = class LoginRoutes extends Routes {
  attach () {
    this._get('/login', (req, res) => {
      res.render('login/login')
    }).skipLogin()

    this._get('/wellcome', (req, res) => {
      res.render('login/wellcome')
    }).skipLogin()

    this._post('/login', (req, res) => {
      var user

      if (req.body.access === undefined) {
        req.session.loggedUserID = 0
      } else {
        UsersProvider.checkUser(req.body.access, req.body.pass)
        user = UsersProvider.get(req.body.access)

        // Cria um password, caso não tenha nenhum para o usuário
        if (!user.pass) {
          user.pass = req.body.pass
          User.upsert({ id: user.id }, user)
        }

        UsersProvider.checkCanLogin(user, true)

        req.session.loggedUserID = user.id
      }

      if (user) {
        res.status(200).send(user)
      } else {
        req.session = null
        res.status(200).send(null)
      }
    })._api()

    this._post('/reset-password', (req, res) => {
      new CustomerPasswordEmail().go(req.body.email, () => {

      })
    }).cors()
  }
}
