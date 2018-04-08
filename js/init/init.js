//Load enviroment variable into node process.env. See any *.env files on root dir.
require('../init/dotenv.js');

//Save App dir
global.__appDir = require('path').dirname(require.main.filename);
//Load all databases
require('../db/DataBase.js');

//Load all util code
global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Dat = require('../util/date.js');
global.Str = require('../util/string.js');
global.Const = require('../const/const.js');

//Build the prototypes
require('../init/prototypes.js');

//Trigger the scheduled jobs
require('../jobs/Jobs.js').schedule(false);