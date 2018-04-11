module.exports = class User {

  constructor(id, name) {
    this.id = parseInt(id);
    this.name = name;
  }

  db() {
    return Schema.Model(this);
  }

  save(callback) {
    return Schema.Build(this).save(callback);
  }
};