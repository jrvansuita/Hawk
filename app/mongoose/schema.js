module.exports = {
  Model(object) {
    return getModel(object);
  },

  Build(object) {
    return new(this.Model(object))(object);
  }
};

function getModel(object) {
  var name = object.constructor.name;

  if (Mongoose.models[name] === undefined) {
    return Mongoose.model(name, build(object));
  } else {
    return Mongoose.model(name);
  }
}

function build(object) {
  var newSchema = {};

  Object.keys(object).forEach((key) => {
    newSchema[key] = object[key].constructor;
  });

  return new Mongoose.Schema(newSchema);
}