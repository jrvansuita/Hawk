
const DoneLaws = require('../laws/done-laws.js');
const PickingLaws = require('../laws/picking-laws.js');
const BlockLaws = require('../laws/block-laws.js');
const InprogressLaws = require('../laws/inprogress-laws.js');
const PendingLaws = require('../laws/pending-laws.js');

global.salesGroups = {};
var fullList;

module.exports={

  get(){
    global.salesGroups = {};
    fullList = [];

    this.registryHeaders();

    for (var i = 0; i < fullList.length;  i++) {
      this.registry(fullList[i]);
    }

    return global.salesGroups;
  },

  registryHeaders(){
    this.header('sales', 'Em Picking', InprogressLaws.getSaleList(),'paper-ring');
    this.header('sales', 'Aguardando Picking', PickingLaws.getFullList(), 'paper-waiting');
    this.header('sales', 'Separados', DoneLaws.getList(), 'paper-checked');
    this.header('sales', 'Bloqueados', BlockLaws.list(), 'paper-blocked');
    this.header('sales', 'Pendência', PendingLaws.getSaleList(), 'paper-alert');
  },

  registry(sale){
    this.group('sales', 'Todos os Pedidos', 'all-papers');
    this.group('transps', sale.transport, 'transport/' + sale.transport);

    if (sale.client){
      this.group('ufs', sale.client.uf);
    }

    this.group('dates', sale.data);
  },

  header(groupName, groupValue, arr, icon){
    if (arr.length>0){
      fullList.push(...arr);

      this._incGroup(groupName, groupValue, arr.length, icon);
    }
  },

  group(groupName, groupValue, icon){
    if(groupName && groupValue){
      this._incGroup(groupName, groupValue, 1, icon);
    }
  },

  _incGroup(groupName, groupValue, incs, icon){
    var group = this._createGroup(groupName);

    if (!group[groupValue]){
      group[groupValue] = {value:0, icon: icon};
    }

    group[groupValue].value += incs ? incs : 1;
  },

  _createGroup(groupName){
    if (!global.salesGroups[groupName]){
      global.salesGroups[groupName] = {};
    }

    return global.salesGroups[groupName];
  }

};
