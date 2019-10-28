var Str = {

  def(str, def) {
    return typeof(str) === 'string' ? str : (typeof(def) == 'string' ? def : '');
  },

  defStr(str, def) {
    return !str ? (!def ? '' :def) : str;
  },

  between(str, left, right) {
    return str.split(left).pop().split(right)[0];
  },

  short: function(val, max) {
    var result = val.slice(0, max);
    return result + ((result.length !== val.length) ? '...' : '');
  },

  first_word: function(val) {
    var names = val ? val.split(' ') : "";
    return names.length > 0 ? names[0] : 'Desconhecido';
  },

  extract(str){
    var result = str.match(/[a-zA-Z]/g);

    if (!result){
      return str;
    }

    return result.toString();
  },

  normalize(str){
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  },

  capitalize(s){
    return  s.split(" ").map(function(w) { return w.charAt(0).toUpperCase() + w.substr(1) }).join(" ");
  }

};


if (typeof module != 'undefined')
module.exports = Str;


String.prototype.toMMSS = function() {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ':' + seconds;
};
