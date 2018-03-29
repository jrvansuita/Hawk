var _pathx = require('path');
global.__appDir = _pathx.dirname(require.main.filename);

var DataBase = require('../db/DataBase.js');

global.Util = require('../util/util.js');


require('../init/prototypes.js');