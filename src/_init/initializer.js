const ServerRunner = require('../server/runner.js')
const ServerMidlewares = require('../server/midlewares.js')

module.exports = class Initializer {
  setSandboxMode (y) {
    this.sandboxMode = y
    return this
  }

  setJestMode (y) {
    this.jestMode = y
    return this
  }

  begin () {
    return new Promise(resolve => {
      this.enviromentVariables()
      this.globalVariables()
      this.mongoose()

      this.loadParams(() => {
        console.log('[Initilizer] - Carregou os Parâmetros')
        this.utilities()

        if (this.sandboxMode) {
          resolve()
        } else {
          this.loadUsers(() => {
            console.log('[Initilizer] - Carregou os Usuários')
            this.expressServer()
            this.jobs(() => {
              resolve()
            })
          })
        }
      })
    })
  }

  globalVariables () {
    global.eccoConnErrors = 0
  }

  enviromentVariables () {
    if (!process.env.IS_PRODUCTION) {
      require('dotenv').config()
    }

    return this
  }

  mongoose () {
    require('../mongoose/mongoose.js')
  }

  loadParams (callback) {
    require('../vault/param-vault.js').init(callback)
  }

  loadUsers (callback) {
    require('../provider/user-provider.js').loadAllUsers(callback)
  }

  utilities () {
    global.Util = require('../util/util.js')
    global.Arr = require('../util/array.js')
    global.Num = require('../util/number.js')
    global.Floa = require('../util/float.js')
    global.Dat = require('../util/date.js')
    global.Sett = require('../util/sett.js')
    global.Menu = require('../util/menu.js')

    global.Str = require('../util/string.js')
    global.Const = require('../const/const.js')

    require('../protos/prototypes.js')
    return this
  }

  expressServer () {
    new ServerRunner(!this.jestMode).build().run((server) => {
      new ServerMidlewares(server).attach()
    })
  }

  jobs (callback) {
    if (global.Params.enableJobsOnDevMode() || process.env.IS_PRODUCTION) {
      require('../jobs/controller/pool.js').initialize(callback)
    } else {
      callback()
    }

    return this
  }
}
