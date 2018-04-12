module.exports = class DataAccess {

  raw() {
    console.log(Schema.Raw(this));
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
    var query = {};
    var keys = this.getKey();

    keys.forEach((k, i) => {
      query[k] = values[i];
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
  static findByKey(keyValue, callback) {
    this.staticAccess().findOne(this.getKeyQuery(keyValue), callback);
  }

  //Retrive the last stored element
  static getLast(callback) {
    this.staticAccess().findOne().sort({
      field: 'asc',
      _id: -1
    }).limit(1).exec(callback);
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

  //Inserts the object or update based on the primary key
  upsert(callback) {
    var query = this.constructor.getKeyQuery(this.constructor.getKeyVal(this));

    this.classAccess().findOneAndUpdate(query, this, {
      upsert: true
    }, (err, doc) => {
      if (callback)
        callback(err, doc);
    });
  }




};