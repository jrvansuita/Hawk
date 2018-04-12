//Load enviroment variable into node process.env. See any *.env files on root dir.
require('../init/dotenv.js');

//Save App dir
global.__appDir = require('path').dirname(require.main.filename);
//Load all databases
require('../db/DataBase.js');

//Load all Mongoose
require('../mongoose/mongoose.js');

//Load all util code
global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Floa = require('../util/float.js');
global.Dat = require('../util/date.js');
global.Str = require('../util/string.js');
global.Const = require('../const/const.js');

//Build the prototypes
require('../init/prototypes.js');

//Trigger the scheduled jobs
require('../jobs/Jobs.js').schedule(true);

var Sale = require('../bean/sale.js');


// Sale.getLast((err, doc) => {
//   console.log(doc);
// });
//
// Sale.findByKey("34", (err, doc) => {
//   console.log(doc);
// });
//

// var s = new Sale(0, new Date(), 2, parseFloat("1.45"));
// s.raw();
// s.upsert();

//User.find();
// var x = new User(3, 'teste');
// x.upsert();

//x.print();