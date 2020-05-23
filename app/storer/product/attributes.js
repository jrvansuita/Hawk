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
    var result = cache;

    if (this.filterDescriptionOrTag){

      var arr = cache[this.filterDescriptionOrTag] || cache[map[this.filterDescriptionOrTag]];

      if (this.filterOption){
        if (arr != undefined){
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].description == this.filterOption){
              return arr[i];
            }
          }
        }

        return null;
      }

      return arr;
    }

    return result;
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
