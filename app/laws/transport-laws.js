global.transportList = {};

global.selectedTransps = undefined;

module.exports = {

  select(selected){

    if (selected){
      if (selected.includes('all')){
        global.selectedTransps = undefined;
      }else{

        var transps = [selected];

        if (transps.includes("|")){
          transps = selected.split('|');
        }


        global.selectedTransps = transps;
      }
    }
  },

  getSelecteds(){
    return global.selectedTransps;
  },

  assert(saleList){ 
    if (global.selectedTransps && (global.selectedTransps.length > 0)){
      if (saleList.length > 0) {
        saleList = saleList.filter(sale =>{
          return global.selectedTransps.join(' ').includes(Str.defStr(sale.transport, Const.no_transport));
        });
      }
    }

    return saleList;
  },

  put(transportName){
    global.transportList[transportName] = transportName;
  },


  getObject() {
    return global.transportList;
  }

};
