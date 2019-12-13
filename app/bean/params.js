module.exports = class Params extends DataAccess {

  constructor() {
    super();
    this.id = 1;
  }

  static getKey() {
    return ['id'];
  }

  put(name, val){
    this[name] = val;
    return this;
  }

  save(){
    Params.updateOrSet({'id': 1}, this);
  }



};
