const Routes = require('./_route.js')
const UsersProvider = require('../provider/user-provider.js')
const ParamVault = require('../vault/param-vault.js')

module.exports = class SettingsRoutes extends Routes {
  attach () {
    this._page('/settings', (req, res) => {
      res.render('settings/settings', { jobs: global.jobsPoll })
    })

    this._page('/main-settings', (req, res) => {
      res.render('settings/main-settings')
    })

    this._page('/api-settings', (req, res) => {
      res.render('settings/api-settings')
    })

    this._page('/social-settings', (req, res) => {
      res.render('settings/social-settings')
    })

    this._post('/put-main-param', (req, res) => {
      ParamVault.put(req.body.name, req.body.val)
      res.status(200).send('OK')
    })
  }
}
