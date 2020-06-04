

module.exports = class Enumerator extends DataAccess {

  constructor(name, explanation, tag) {
    super();
    this.id = Util.id();
    this.name = Str.def(name);
    this.explanation = Str.def(explanation);
    this.tag = Str.def(tag);
    this.items = [];
  }

  static getKey() {
    return ['id'];
  }

  put(icon, description, name, value){
    this.items.push({icon:icon, description:description, name: name, value: value});
    return this;
  }


};
