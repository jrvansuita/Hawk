var mongoose = require('mongoose')

if (!process.env.MLAB_MONGO_CONN) {
  throw 'MLab/Mongo connection not defined'
}

mongoose.connect(process.env.MLAB_MONGO_CONN, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.set('useFindAndModify', false)

global.Mongoose = mongoose
global.Schema = require('./schema.js')
global.DataAccess = require('./data-access.js')
