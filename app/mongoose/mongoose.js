var mongoose = require('mongoose');

if (!process.env.MLAB_MONGO_CONN) {
  throw 'MLab/Mongo connection not defined';
}

mongoose.connect(process.env.MLAB_MONGO_CONN, { useNewUrlParser: true });

global.Mongoose = mongoose;
global.Schema = require('../mongoose/schema.js');
global.DataAccess = require('../mongoose/data-access.js');
