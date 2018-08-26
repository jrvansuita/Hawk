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

//Trigger the scheduled jobs
require('../jobs/Jobs.js').schedule(false);


//Ajust $points
//require('../init/assert-points.js');

/*const Pending = require('../bean/pending.js');


Pending.findAll((err, docs)=>{
  docs.forEach((doc, index)=>{

  if (doc.solved.toString() == 'true'){
    doc.status = 2;
  }else
  if (doc.solving.toString() == 'true'){
    doc.status = 1;
  }else{
    doc.status = 0;
  }


  Pending.updateAll({_id: doc._id}, doc, function(err, numberAffected){
    console.log('ok');
  });


  });

});*/
