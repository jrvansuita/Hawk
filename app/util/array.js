var Arr = {

  is(a){
    return Array.isArray(a);
  },

  notIn(array, str){
    return !this.isIn(array, str);
  },

  isIn(array, str){
    return this.matchAny(array, str);
  },

  matchAll(array, str){
    return this.match(array, str, 'every');
  },

  matchAny(array, str){
    return this.match(array, str, 'some');
  },

  match(array, str, checking){
    return this.findInArray(array, str, checking, true);
  },

  includesAll(array, str, checking){
    return this.includes(array, str, 'every');
  },

  includesAny(array, str, checking){
    return this.includes(array, str, 'some');
  },

  includes(array, str, checking){
    return this.findInArray(array, str, checking, false);
  },

  findInArray(array, str, checking, equal){
    str = str.toString().toLowerCase();

    return array[checking]((s)=>{
      s =  s.toString().toLowerCase();
      return equal ? str == s : str.includes(s);
    });
  }

};





if (typeof module != 'undefined')
module.exports = Arr;
