var _pathx = require('path');
global.__appDir = _pathx.dirname(require.main.filename);

require('../db/DataBase.js');

global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Dat = require('../util/date.js');
global.Str = require('../util/string.js');
global.Const = require('../const/const.js');


require('../init/prototypes.js');

require('../jobs/Jobs.js').schedule(false);