module.exports = class Template extends DataAccess {
  constructor (name, subject, content, usage, sample, type) {
    super()
    this.id = Util.id()
    this.name = Str.def(name)
    this.subject = Str.def(subject)
    this.content = Str.def(content)
    this.usage = Str.def(usage)
    this.sample = sample || {}
    this.type = Str.def(type, 'block') // block or email
    this.updated = new Date()
  }

  static getKey () {
    return ['id']
  }

  static getAllEmails (callback) {
    Template.find({ type: 'email' }, callback)
  }

  static getAllBlocks (callback) {
    Template.find({ type: 'block' }, callback)
  }

  static findByUsage (usage, callback) {
    Template.findOne({ usage: usage }, callback)
  }

  static updateSample (id, data) {
    Template.upsert({ id: id }, { sample: data })
  }

  static refresh (id) {
    Template.upsert({ id: id }, { updated: new Date() })
  }

  static delete (id, callback) {
    Template.findOne({ id: id }, (err, obj) => {
      if (obj) { obj.remove() }

      callback()
    })
  }

  static duplicate (id, callback) {
    Template.findOne({ id: id }, (err, obj) => {
      new Template('[Duplicado] ' + obj.name, obj.subject, obj.content, null, null, obj.type).upsert((err, doc) => {
        callback(doc)
      })
    })
  }
}
