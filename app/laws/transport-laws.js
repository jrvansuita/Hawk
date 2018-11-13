global.transportList = {};

global.selectedTransp = undefined;

module.exports = {

  select(selected){
    global.selectedTransp = selected;
  },

  assert(saleList){
    if (global.selectedTransp){
      if (saleList.length > 0) {
        saleList = saleList.filter(sale =>{
          return Str.defStr(sale.transportador, Const.no_transport).includes(global.selectedTransp);
        });
      }
    }

    return saleList;
  },

  put(transportName){
    global.transportList[transportName] = transportName;
  },

  excluir_put(transportName){
    var transp = Util.twoNames(transportName, Const.no_transport);

    global.transportList[transp] = transp;
    return transp;
  },

  getObject() {
    return global.transportList;
  }

};
