module.exports = class DataAccess {


  toObject(){
    delete this.__v;
    delete this._id;
    delete this['$setOnInsert'];

    return this;
  }


// -- Abstract -- //

//It's an abstract method and has to be implemented on child class
//Define the attr name of the Primary Key
static getKey() {
  return ["Not Defined"];
}

//Retrive the primary key value from the object provided
static getKeyVal(object) {
  var keyValues = object.constructor.getKey();

  keyValues.forEach((k, i) => {
    keyValues[i] = object[k];
  });

  //return object[object.constructor.getKey()];

  return keyValues;
}

//Builds the query for primary key quering
static getKeyQuery(values) {

  if (values instanceof Array){
    if (values[0] == undefined) return {};
  }



  var query = {};
  var keys = this.getKey();

  keys.forEach((k, i) => {
    query[k] = values instanceof Array ? values[i] : values;
  });

  return query;
}



// --- Static -- //
//A static acess to child model
static staticAccess() {
  //Create a new child to pass to schema
  return Schema.Model(new this());
}

//Find all elements from current entity
static findAll(callback) {
  this.find({}, callback);
}

//Find one element from current query
static findOne(query, callback) {
  this.staticAccess().findOne(query, callback);
}

//Find any elements that match the query provided
static find(query, callback) {
  this.staticAccess().find(query, callback);
}

//Find any elements that match the query provided
static findAndSort(query, sortField, callback) {
  this.staticAccess().find(query).sort(sortField).exec(callback);
}

//Find any elements that match the query provided
static findByKey(keyValue, callback) {
  this.staticAccess().findOne(this.getKeyQuery(keyValue), callback);
}

static like(keyValue, limit, callback){
  this.staticAccess()
  .find(this.getKeyQuery(new RegExp(keyValue, "i")))
  .limit(limit)
  .exec(callback);
}


//Find any elements that match the query provided
static paginate(query, page, sort, rowsPerPage, callback) {
  page--;//Convert to index;

  rowsPerPage = rowsPerPage || 30;

  this.staticAccess()
  .find(query)
  .sort(sort)
  .skip(page * rowsPerPage)
  .limit(rowsPerPage)
  .exec(callback);
}

//Retrive the last stored element
static getLast(callback) {
  this.staticAccess().findOne().sort({
    field: 'asc',
    _id: -1
  }).limit(1).exec(callback);
}

static aggregate(query, callback) {
  this.staticAccess().aggregate(query,
    function(err, res) {
      if (callback)
      callback(err, res);
    });
  }

  //Upsert using provided query and data
  static upsert(query, data, callback) {
    delete data.__v;
    this.staticAccess().findOneAndUpdate(query, data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }, (err, doc) => {
      if (callback)
      callback(err, doc);
    });
  }

  //Update using provided query and data
  static updateAll(query, data, callback) {
    delete data.__v;
    this.staticAccess().updateMany(query, data, {
      multi: true
    }, (err, doc) => {
      if (callback)
      callback(err, doc);
    });
  }

  static updateOrSet(query, data, callback) {
    this.staticAccess().findOneAndUpdate(query, data, {
      upsert: true,
      runValidators: false,
      strict: false
    }, (err, doc) => {
      if (callback)
      callback(err, doc);
    });
  }

  static create(data, callback){
    this.staticAccess().create(data, function (err, obj) {
      if (callback){
        callback(err, obj);
      }
    });
  }

  static removeAll(query, callback) {
    this.staticAccess().deleteMany(query, (err) => {
      if (callback)
      callback(err);
    });
  }

  static remove(object, callback) {
    this.staticAccess().findOneAndRemove(this.staticAccess().getKeyQuery(this.staticAccess().getKeyVal(object)), (err) => {
      if (callback)
      callback(err);
    });
  }


  // --- Class -- //
  //A class access to the class model
  classAccess() {
    //Create a new child to pass to schema
    return Schema.Model(this);
  }


  // save(callback) {
  //   Schema.Build(this).save(callback);
  // }

  getPKQuery() {
    return this.constructor.getKeyQuery(this.constructor.getKeyVal(this));
  }



  insert(callback){
    this.classAccess().save((err, results)=>{
      if (callback){
        callback(err, results);
      }
    });
  }

  //Inserts the object or update based on the primary key
  upsert(callback) {
    delete this.__v;
    var query = this.getPKQuery();

    this.classAccess().findOneAndUpdate(this.getPKQuery(), this, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }, (err, doc) => {
      if (callback)
      callback(err, doc);
    });
  }

  update(callback) {
    this.classAccess().updateOne(this.getPKQuery(),
    this, {
      multi: false
    }, (err, doc) => {
      if (callback)
      callback(err, doc);
    });
  }

  remove(callback) {
    this.classAccess().findOneAndRemove(this.getPKQuery(), (err) => {
      if (callback)
      callback(err);
    });
  }




};
