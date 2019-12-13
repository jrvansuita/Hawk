module.exports = class Initializer{

  constructor(appPath, testMode){
    global.__appDir = appPath;
    this.testMode = testMode;
  }

  begin(onTerminate){
    this.enviromentVariables();
    this.globalVariables();
    this.mongoose();

    this.loadParams(() => {
      console.log('[Initilizer] - Carregou os Parâmetros');
      this.utilities();


      if (this.testMode){
        onTerminate();
      }else{
        this.loadUsers(() => {
          console.log('[Initilizer] - Carregou os Usuários');
          this.expressServer();
          this.jobs(() => {
            onTerminate();
          });
        });
      }
    });
  }

  globalVariables(){
    global.eccoConnErrors = 0;
  }


  enviromentVariables(){
    if (!process.env.NODE_ENV) {
      require('dotenv').config();
    }
  }

  mongoose(){
    require('../mongoose/mongoose.js');
  }

  loadParams(callback){
    require('../vault/param-vault.js').init(callback);
  }

  loadUsers(callback){
    require('../provider/user-provider.js').loadAllUsers(callback);
  }

  utilities(){
    global.Util = require('../util/util.js');
    global.Num = require('../util/number.js');
    global.Floa = require('../util/float.js');
    global.Dat = require('../util/date.js');
    global.Sett = require('../util/sett.js');
    global.Menu = require('../util/menu.js');

    global.Str = require('../util/string.js');
    global.Const = require('../const/const.js');

    require('../protos/prototypes.js');
  }

  expressServer(){
    require('../server/express-runner.js');
    require('../server/express-controls.js');
  }

  jobs(){
    require('../jobs/controller/pool.js').initialize();
  }

}
