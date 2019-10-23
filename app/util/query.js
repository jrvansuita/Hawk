var prefix = '';

module.exports = class Query {

  constructor(p) {
    prefix = p;
  }

  hasParams(){
    return Object.keys(this).length > 0;
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
      quering += prefix + key + '=' + query[key] + '&';
    });

    return quering;
  }


};
