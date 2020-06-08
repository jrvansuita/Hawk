
const Enumerator = require('../bean/enumerator.js');

module.exports = class {

  static storeFromScreen(params, callback) {
    var object = new Enumerator(
      params.name,
      params.explanation,
      params.tag,
      params.items
    );

    if (params.id){
      object.id = params.id;
    }

    if (params.id){
      Enumerator.findOne({id : params.id}, (err, obj)=>{
        object.upsert((err, doc)=>{
          callback(doc ? doc.id : 0);
        });
      });
    }else{
      Enumerator.create(object, (err, doc)=>{
        callback(doc ? doc.id : 0);
      });
    }

  }




};
