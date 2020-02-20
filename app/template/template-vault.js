
const Template = require('../bean/template.js');

module.exports = class TemplateHandler {

  static storeFromScreen(params, callback) {

    var object = new Template(
      params.name,
      params.subject,
      params.content,
      params.type
    );


    if (params._id && params._id.toString().length>0){
      object._id = params._id;
    }

    if (object._id){
      object.upsert((err, doc)=>{
        callback(doc ? doc._id : 0);
      });
    }else{
      Template.create(object, (err, doc)=>{
        callback(doc ? doc._id : 0);
      });
    }

  }




};
