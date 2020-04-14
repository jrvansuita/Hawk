var prefix = '';

module.exports = class Query {

  constructor() {
  }

  hasParams(){
    return Object.keys(this).length > 0;
  }

  clear(){
   Object.keys(this).forEach((key, i) => {
     delete this[key];
   });
  }

  add(key, value) {
    this[key] = value;
  }

  addDate(key, value) {
    this.add(key, Dat.api(value));
  }

  build() {
    var quering = '?';

    var query = this;

    Object.keys(this).forEach(function(key, index) {
      quering +=  key + '=' + query[key] + '&';
    });

    return quering;
  }


};
