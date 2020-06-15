module.exports = {
  Raw (object) {
    return rawModel(object)
  },

  Model (object) {
    return getModel(object)
  },

  Build (object) {
    return new (this.Model(object))(object)
  }
}

function getModel (object) {
  var name = object.constructor.name

  if (Mongoose.models[name] === undefined) {
    return Mongoose.model(name, new Mongoose.Schema(rawModel(object)))
  } else {
    return Mongoose.model(name)
  }
}

function rawModel (object) {
  var newSchema = {}

  Object.keys(object).forEach((key) => {
    if (object[key] != undefined) {
      if (typeof object[key] !== 'function') {
        newSchema[key] = object[key].constructor
      }
    }
  })

  return newSchema
}
