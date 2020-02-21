module.exports = class Template extends DataAccess {

  constructor(name, subject, content, type) {
    super();
    this.name = Str.def(name);
    this.subject = Str.def(subject);
    this.content = Str.def(content);
    this.type = Str.def(type);
    this.sample = {};
  }

  static getKey() {
    return ['_id'];
  }

  static findByType(type, callback){
    Template.findOne({type:type}, callback);
  }

  static updateSample(id, data){
    Template.upsert({_id: id}, {sample : data});
  }

  static delete(id, callback){
    Template.findOne({_id:id}, (err, obj)=>{
      if (obj)
      obj.remove();

      callback();
    });
  }

};
