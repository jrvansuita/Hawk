const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');

var cache;
var map;

module.exports = {

  isCached(){
    return cache != undefined;
  },

  filter(description, option){
    this.filterDescriptionOrTag = description;
    this.filterOption = option;

    return this;
  },

  _prepare(data){
    cache = {};
    map = {};

    data.forEach((each) => {
      map[each.idExterno] = each.descricao;
      var options = each._Opcoes ? each._Opcoes[0] : null;

      if (options){
        cache[each.descricao] = Object.keys(options).map((key) => {
          return {id: key, idAttr: each.id, tag: each.idExterno, description: options[key]};
        });
      }else{
        cache[each.descricao] = each;
      }
    });
  },

  _onResult(){
    if (this.filterDescriptionOrTag){

      var data = cache[this.filterDescriptionOrTag] || cache[map[this.filterDescriptionOrTag]];

      if (this.filterOption && Arr.is(data)){
        return data.find((each) => {
          return each.description == this.filterOption;
        });
      }

      return data;
    }

    return cache;
  },

  get(){
    if (this.isCached()){
      return this._onResult();
    }else{
      return undefined;
    }
  },


  load(callback){
    this.onResultCallback = callback;

    if (!cache){
      new EccosysProvider().attributes().go((data) => {
        this._prepare(data);
        callback(this._onResult());
      })
    }else{
      callback(this._onResult());
    }
  }
}
