
var cache = {};

module.exports = class Enumerator extends DataAccess {

  constructor(name, explanation, tag, items) {
    super();
    this.id = Util.id();
    this.name = Str.def(name);
    this.explanation = Str.def(explanation);
    this.tag = Str.def(tag);
    this.items = items || [];
  }

  static getKey() {
    return ['id'];
  }

  static get(tagOrId, callback){
    if(cache[tagOrId]){
      console.log('cache');
      callback(cache[tagOrId]);
    }else{
      this.findOne((typeof tagOrId == 'number') ? {id: tagOrId} : {tag: tagOrId}, (err, data) => {
        cache[tagOrId] = data;
        console.log('nao');
        callback(data);
      });
    }
  }

  static getKeyItems(tag, callback){
    this.get(tag, (data) => {
      callback(data.items.reduce((o, item) => {
        o[item.value] = item;
        return o;
      },{}));
    });
  }

  put(icon, description, name, value){
    this.items.push({icon:icon, description:description, name: name, value: value});
    return this;
  }

  static delete(id, callback){
    this.findOne({id:id}, (err, obj)=>{
      if (obj)
      obj.remove();

      callback();
    });
  }


  static duplicate(id, callback){
    this.findOne({id:id}, (err, obj)=>{
      new Enumerator('[Duplicado] ' + obj.name, obj.explanation, 'Nenhuma', obj.items).upsert((err, doc) => {
        callback(doc);
      })
    });
  }


};
