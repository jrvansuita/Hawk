const Routes = require('./_route.js')
const UsersProvider = require('../provider/user-provider.js')
const UsersVault = require('../vault/user-vault.js')

module.exports = class UserRoutes extends Routes {
  attach () {
    this._get('/user', (req, res) => {
      var user = UsersProvider.get(req.query.userId)

      if (user) {
        this._resp().sucess(res, user)
      } else {
        this._resp().error(res, 'Usuário ' + req.query.userId + ' não encontrado' + '\nUser Session Id: ' + req.session.loggedUserID + '\n' + new Error().stack)
      }
    }).skipLogin()

    this._page('/user-registering', (req, res) => {
      var user = UsersProvider.get(req.session.loggedUserID)

      if (!user || (req.query.userId && (user.full || (user.id === req.query.userId)))) {
        user = UsersProvider.get(req.query.userId)
      }

      res.render('user/user-registering', { user: user })
    })

    this._page('/team-board', (req, res) => {
      res.render('performance/team-board', { data: UsersProvider.getByGroup() })
    })

    this._page('/users-listing', (req, res) => {
      res.render('user/users-listing', { users: UsersProvider.getAllUsers() })
    })

    this._post('/user-active', (req, res) => {
      UsersVault.active(req.body.userId, req.body.active, () => {
        res.status(200).send('OK')
      })
    })

    this._post('/user-registering', (req, res) => {
      UsersVault.storeFromScreen(req.body, (userId) => {
        res.redirect('/user-registering?userId=' + userId)
      })
    })

    this._post('/user-delete', (req, res) => {
      UsersVault.delete(req.body.id, () => {
        res.status(200).send('Ok')
      })
    })

    this._post('/upload-user-avatar', (req, res) => {
      UsersVault.changeImage(req.body.userId, req.body.avatar, (url) => {
        res.status(200).send(url)
      })
    })
  }
}
