const PickingLaws = require('../laws/picking-laws.js');

global.selectedOrder = '';

module.exports = {

  select(selected){
    if (selected || !global.selectedOrder){
      if (selected != global.selectedOrder){
        global.selectedOrder = selected || getDefault();
        this.apply();
      }
    }
  },

  getSelected(){
    return global.selectedOrder;
  },

  getOrder(){
    return getFiltersObject()[global.selectedOrder];
  },

  apply(){
    if (global.selectedOrder){
      var list = PickingLaws.getFullList();
      if (list.length > 0){
        console.log('aplicou a ordem');
        PickingLaws.set(list.sort(this.getOrder().func));
      }
    }
  },

  getObject() {
    var result = getFiltersObject();
    Object.keys(result).forEach(key => {result[key] = result[key].name});
    return result;
  }

};


function getDefault(){
  return 'old_first';
}

function getFiltersObject(){
  return {
    new_first : {
      name: 'Mais Recentes',
      func: (a, b)=>{
        return new Date(b.data) - new Date(a.data);
     }
  },
    old_first: {
      name: 'Mais Antigos',
      func: (a, b) => {
        return new Date(a.data) - new Date(b.data);
      }
    },

    items: {
      name: 'Mais Itens',
      func: (a, b) => {
        return b.itemsQuantity - a.itemsQuantity;
      }
    },

    delivery_time: {
      name: 'Tempo de Entrega',
      func: (a, b) => {
        return a.deliveryTime - b.deliveryTime;
      }
    }
  }
}
