var Arr = {
  is(a) {
    return Array.isArray(a);
  },

  notIn(array, str) {
    return !this.isIn(array, str);
  },

  find(array, str, compareFunc) {
    return array.find((s) => {
      return compareFunc ? compareFunc() : str === s;
    });
  },

  isIn(array, str) {
    return this.matchAny(array, str);
  },

  matchAll(array, str) {
    return this.match(array, str, 'every');
  },

  matchAny(array, str) {
    return this.match(array, str, 'some');
  },

  match(array, str, checking) {
    return this.findInArray(array, str, checking, true);
  },

  includesAll(array, str, checking) {
    return this.includes(array, str, 'every');
  },

  includesAny(array, str, checking) {
    return this.includes(array, str, 'some');
  },

  includes(array, str, checking) {
    return this.findInArray(array, str, checking, false);
  },

  findInArray(array, str, checking, equal) {
    str = str.toString().toLowerCase();

    return array[checking]((s) => {
      s = s.toString().toLowerCase();
      return equal ? str == s : str.includes(s);
    });
  },

  matchCount(base, ref) {
    if (!base || !ref) return 0;
    return base.reduce((c, b) => {
      return (
        c +
        (ref.some((e) => {
          return e === b;
        })
          ? 1
          : 0)
      );
    }, 0);
  },

  matchPercent(base, ref) {
    if (!base || !ref) return 0;
    return (this.matchCount(base, ref) * 100) / base.length;
  },

  matchCompare(base, ref) {
    var c = this.matchCount(base, ref);

    return {
      matches: c,
      waste: base.length + ref.length - c * 2,
    };
  },
};

if (typeof module !== 'undefined') {
  module.exports = Arr;
}
