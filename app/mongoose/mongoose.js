var mongoose = require('mongoose');

mongoose.connect(process.env.MLAB_MONGO_CONN);

global.Mongoose = mongoose;
global.Schema = require('../mongoose/schema.js');
global.DataAccess = require('../mongoose/data-access.js');