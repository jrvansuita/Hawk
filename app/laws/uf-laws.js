global.ufList = {};

global.selectedUf = undefined;

const unknow = 'Não encontrado';


module.exports = {

  select(selected){
    global.selectedUf = selected;
  },

  assert(saleList){

    if (global.selectedUf){
      if (saleList.length > 0) {
        saleList = saleList.filter(sale =>{
          return Str.defStr(sale.client ? sale.client.uf : 'none', unknow).includes(global.selectedUf);
        });
      }
    }
 
    return saleList;
  },

  put(name){
    global.ufList[name] = name;
    return name;
  },

  getObject() {
    return global.ufList;
  }

};
