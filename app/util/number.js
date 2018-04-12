module.exports = {

  money: function(val) {
    return 'R$ ' + parseFloat(val).toFixed(2).toString().replace('.', ',');
  },

  reduceFloat: function(number) {
    var SI_PREFIXES = ["", "k", "M", "G", "T", "P", "E"];

    // what tier? (determines SI prefix)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a prefix
    if (tier == 0) return number;

    // get prefix and determine scale
    var prefix = SI_PREFIXES[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add prefix as suffix
    return scaled.toFixed(1) + prefix;

  },

  format(n) {
    if (this.isInt(n) || n < 1000) {
      return this.int(n);
    } else {
      return this.reduceFloat(n);
    }
  },

  def(num, def) {
    return ((num !== undefined) && (typeof(parseInt(num)) === 'number')) ? this.int(num) : (def === undefined ? 0 : def);
  },

  int: function(val) {
    return Math.trunc(val);
  },

  isInt(n) {
    return n % 1 === 0;
  }

};