module.exports = {

  money: function(val) {
    return 'R$ ' + parseFloat(val).toFixed(2).toString().replace('.', ',');
  },

  small_money: function(number) {
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

  int: function(val) {
    return Math.trunc(val);
  },

};