const Routes = require('./_route.js')
const ParamVault = require('../vault/param-vault.js')

module.exports = class SettingsRoutes extends Routes {
  mainPath() {
    return '/settings'
  }

  attach() {
    this._page('', (req, res) => {
      res.render('settings/settings', { jobs: global.jobsPoll })
    })

    this._page('/main', (req, res) => {
      res.render('settings/main-settings', { fullparams: global.Params.bundle(), teste: 'veio' })
    })

    this._page('/api', (req, res) => {
      res.render('settings/api-settings', { fullparams: global.Params.bundle() })
    })

    this._page('/social', (req, res) => {
      res.render('settings/social-settings', { fullparams: global.Params.bundle() })
    })

    this._post('/put-param', (req, res) => {
      ParamVault.put(req.body.name, req.body.val)
      res.status(200).send('OK')
    })
  }
}
