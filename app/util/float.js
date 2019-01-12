

var Floa = {

  def(val, def) {
    return ((val !== undefined) && (typeof(parseFloat(val)) === 'number')) ? val : (typeof(def) === 'number' ? def : 0);
  },

  weight(val){
    val = parseFloat(val);
    return new Intl.NumberFormat('pt-BR', { style: 'decimal',
    minimumFractionDigits: 3,}).format(val);
  }

};





if (typeof module != 'undefined')
module.exports = Floa;
