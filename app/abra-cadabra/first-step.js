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

//Ajust $points
//require('../init/assert-points.js');


var jobs = [];
jobs.push(['job-products.js', '8:30']);
//A contagem de pontos do packing agora é feita automaticamente
//jobs.push(['job-sales.js', ['11','15','17']]);
//jobs.push(['job-picking.js', '4']);

// -- Run Jobs schedules -- //
jobs.forEach((r, index)=>{
  var Clazz = require('../jobs_old/' + r[0]);
  new Clazz().schedule(r[0],r[1]);
});
