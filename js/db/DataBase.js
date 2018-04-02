var DataStore = require('nedb');


function getCollection(name, indexes) {
  var path = __appDir + "/.db/" + name;

  //console.log(path);

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

global.salesDb = getCollection('sales.data', [{
  fieldName: 'number',
  unique: true
}]);

global.usersDb = getCollection('users.data', [{
  fieldName: 'id',
  unique: true
}]);

global.daysDb = getCollection('days.data', [{
  fieldName: 'date',
  unique: false
}]);