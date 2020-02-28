module.exports = class Template extends DataAccess {

  constructor(name, subject, content, type, sample) {
    super();
    this.id = Util.id();
    this.name = Str.def(name);
    this.subject = Str.def(subject);
    this.content = Str.def(content);
    this.type = Str.def(type);
    this.sample = sample || {};
  }

  static getKey() {
    return ['id'];
  }

  static findByType(type, callback){
    Template.findOne({type:type}, callback);
  }

  static updateSample(id, data){
    Template.upsert({id: id}, {sample : data});
  }

  static delete(id, callback){
    Template.findOne({id:id}, (err, obj)=>{
      if (obj)
      obj.remove();

      callback();
    });
  }

  static duplicate(id, callback){
    Template.findOne({id:id}, (err, obj)=>{
      new Template('[Duplicado] ' + obj.name, obj.subject, obj.content).upsert((err, doc) => {
        callback(doc);
      })
    });
  }

};
