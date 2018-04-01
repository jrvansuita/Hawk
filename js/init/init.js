var _pathx = require('path');
global.__appDir = _pathx.dirname(require.main.filename);

var DataBase = require('../db/DataBase.js');

global.Util = require('../util/util.js');
global.Num = require('../util/number.js');
global.Dat = require('../util/date.js');
global.Str = require('../util/string.js');


require('../init/prototypes.js');