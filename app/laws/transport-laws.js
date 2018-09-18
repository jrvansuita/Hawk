global.transportList = {};

global.selectedTransp = undefined;

const unknow = 'Retirada';


module.exports = {

  select(selected){
    global.selectedTransp = selected;
  },

  assert(saleList){
    if (global.selectedTransp){
      if (saleList.length > 0) {
        saleList = saleList.filter(sale =>{
          return Str.defStr(sale.transportador, unknow).includes(global.selectedTransp);
        });
      }
    }

    return saleList;
  },

  put(transportName){
    var transp = Util.twoNames(transportName, unknow);

    global.transportList[transp] = transp;
    return transp;
  },

  getObject() {
    return global.transportList;
  }

};
