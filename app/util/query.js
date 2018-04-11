var dateFormat = require('dateformat');

var prefix = '';

module.exports = class Query {

  constructor(p) {
    prefix = p;
  }

  add(key, value) {
    this[key] = value;
  }

  addDate(key, value) {
    this.add(key, dateFormat(value, "yyyy-mm-dd"));
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