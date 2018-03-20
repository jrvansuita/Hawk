var DataStore = require('nedb');

function getCollection(name, indexes) {
  var path = __dirname + "/.db/" + name;

  var db = new DataStore({
    filename: path,
    autoload: true
  });

  if (indexes)
    for (var i = 0; i < indexes.length; i++) {
      db.ensureIndex(indexes[i]);
    }

  db.persistence.compactDatafile();

  return db;
}

const salesDb = getSalesDb();

function getSalesDb() {
  return getCollection('sales.data');
}

module.exports = {
  sales: function() {
    return salesDb;
  }
};