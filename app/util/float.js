

var Floa = {

  def(val, def) {
    if (val && (val.toString().length > 0) && (typeof(parseFloat(val)) === 'number')){
      return this.floa(val);
    }else{
      if (typeof(def) === 'number'){
        return def;
      }else{
        return 0;
      }
    }
  },

  isFloat(n){
   return /^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/.test(n);
  },



  floa: function(val) {
    return parseFloat(val.toString().replace(",", "."));
  },

  weight(val){
    if (!val){
      return '';
    }

    val = parseFloat(val);
    return new Intl.NumberFormat('pt-BR', { style: 'decimal',
    minimumFractionDigits: 3,}).format(val).replace('.',',');
  },

  isFloatKey(e){
    e = e || window.event;
    var charCode = e.which ? e.which : e.keyCode;
    return /^-?[0-9,]*$/.test(String.fromCharCode(charCode));
  },


  abs(val, digits) {
    return parseFloat(val).toFixed(digits ? digits : 2).toString().replace('.', ',');
  },

};





if (typeof module != 'undefined')
module.exports = Floa;
