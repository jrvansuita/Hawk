
const Template = require('../bean/template.js');

module.exports = class TemplateHandler {

  static storeFromScreen(params, callback) {

    var object = new Template(
      params.name,
      params.subject,
      params.content,
      params.usage,
      null,
      params.type
    );

    if (params.id){
      object.id = params.id;
    }

    if (object.id){
      Template.findOne({id : object.id}, (err, obj)=>{
        object.sample = obj.sample || {};
        object.upsert((err, doc)=>{
          callback(doc ? doc.id : 0);
        });
      });
    }else{
      Template.create(object, (err, doc)=>{
        callback(doc ? doc.id : 0);
      });
    }

  }




};
