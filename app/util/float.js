

var Floa = {

  def(val, def) {
    return ((val !== undefined) && (typeof(parseFloat(val)) === 'number')) ? val : (typeof(def) === 'number' ? def : 0);
  }

};





if (typeof module != 'undefined')
module.exports = Floa;
