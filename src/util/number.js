var Num = {
  money: function (val, trunc) {
    return 'R$ ' + Num.parse(val, trunc);
  },

  moneyVal(val) {
    return parseFloat(val.replace('.', '').replace(',', '.').replace('R$ ', ''));
  },

  parse: function (val, trunc) {
    var digits = trunc ? 0 : 2;
    val = (parseFloat(val) || 0).toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits });

    if (typeof global !== 'undefined') {
      return val.replace('.', '_').replace(',', '.').replace('_', ',');
    }

    return val;
  },

  reduceFloat: function (number, trunc) {
    var SI_PREFIXES = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

    // what tier? (determines SI prefix)
    var tier = (Math.log10(number) / 3) | 0;

    // if zero, we don't need a prefix
    if (tier == 0) return number;

    // get prefix and determine scale
    var prefix = SI_PREFIXES[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add prefix as suffix
    return scaled.toFixed(trunc ? 0 : 1) + prefix;
  },

  format(n, keepInt, trunc) {
    if (this.def(n) < 1000 || (keepInt && this.isInt(n))) {
      return this.points(n);
    } else {
      return this.reduceFloat(n, trunc);
    }
  },

  points(n) {
    return this.int(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 }).replace(',', '.');
  },

  def(num, def) {
    try {
      return parseInt(num) || (def === undefined ? 0 : def);
    } catch (e) {
      return def || 0;
    }
  },

  int: function (val) {
    return Math.trunc(val);
  },

  isInt(n) {
    return n % 1 === 0;
  },

  isEan(ean) {
    try {
      var isNum = /^\d+$/.test(ean);
      return isNum && ean.toString().length == 13;
    } catch (e) {
      return false;
    }
  },

  between(num, min, max) {
    return Math.min(max, Math.max(min, num));
  },

  isNumberKey(e) {
    e = e || window.event;
    var charCode = e.which ? e.which : e.keyCode;
    return /^-?[0-9]*$/.test(String.fromCharCode(charCode));
  },

  extract(str) {
    var fmt = str.match(/[0-9]+/g);
    fmt = fmt ? fmt.join('') : 0;

    return parseInt(fmt);
  },

  percent(num, trunc) {
    num = parseFloat(~~Number(num) > 0 ? num : 0);
    return (trunc ? Math.trunc(num) : num.toFixed(2)).toString() + '%';
  },
};

if (typeof module !== 'undefined') {
  module.exports = Num;
}
