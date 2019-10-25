global.eccoConnErrors = 0;

//Load enviroment variable into node process.env. See any *.env files on root dir.
require('../abra-cadabra/inner/dotenv.js');


//Load all Mongoose
require('../mongoose/mongoose.js');

//Load all util code
global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Floa = require('../util/float.js');
global.Dat = require('../util/date.js');
global.Sett = require('../util/sett.js');
global.Menu = require('../util/menu.js');

global.Str = require('../util/string.js');
global.Const = require('../const/const.js');


//Load Local Users
require('../provider/user-provider.js').loadAllUsers();

//Build the prototypes
require('../abra-cadabra/inner/prototypes.js');
