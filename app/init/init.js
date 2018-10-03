//Load enviroment variable into node process.env. See any *.env files on root dir.
require('../init/dotenv.js');

//Save App dir
global.__appDir = require('path').dirname(require.main.filename);

//Load all Mongoose
require('../mongoose/mongoose.js');

//Load all util code
global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Floa = require('../util/float.js');
global.Dat = require('../util/date.js');

global.Str = require('../util/string.js');
global.Const = require('../const/const.js');


//Load Local Users
require('../provider/UsersProvider.js').loadAllUsers();
console.log('Loaded All Users...');

//Build the prototypes
require('../init/prototypes.js');

//Ajust $points
//require('../init/assert-points.js');


var jobs = [];
jobs.push(['job-products.js', '7.30']);
jobs.push(['job-sales.js', ['11','15', '17']]);

// -- Run Jobs schedules -- //
jobs.forEach((r)=>{
  var Clazz = require('../jobs/' + r[0]);
  new Clazz().schedule(r[1]);
});
