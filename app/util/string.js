module.exports = {

  def(str, def) {
    return typeof(str) === 'string' ? str : (typeof(def) == 'string' ? def : '');
  },

  short: function(val, max) {
    var result = val.slice(0, max);
    return result + ((result.length !== val.length) ? '...' : '');
  },


  first_word: function(val) {
    var names = val ? val.split(' ') : "";
    return names.length > 0 ? names[0] : 'Desconhecido';
  }

};