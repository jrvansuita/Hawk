module.exports = {


  short: function(val, max) {
    var result = val.slice(0, max);
    return result + ((result.length !== val.length) ? '...' : '');
  },


  first_word: function(val) {
    return val.split(' ')[0];
  }

};