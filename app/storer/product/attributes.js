const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');

var cache;
var map;

module.exports = {

  isCached(){
    return cache != undefined;
  },

  description(description){
    this.filterDescription = description;
    return this;
  },

  option(option){
    this.filterOption = option;
    return this;
  },

  tag(tag){
    this.filterTag = tag;
    return this;
  },

  filter(description, option){
    return this.description(description).option(option);
  },

  _prepare(data){
    cache = {};
    map = {};

    data.forEach((each) => {
      var items = [];
      map[each.idExterno] = each.descricao;

      if (each._Opcoes && each._Opcoes.length == 1){
        Object.keys(each._Opcoes[0]).forEach((key) => {
          items.push({id: key, idAttr: each.id, tag: each.idExterno, description: each._Opcoes[0][key]});
        })
      }

      cache[each.descricao] = items;
    });
  },

  _onResult(){
    var result = cache;

    if (this.filterDescription){
      if (this.filterOption){
        var arr = cache[this.filterDescription];
        if (arr != undefined){
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].description == this.filterOption){
              return arr[i];
            }
          }
        }

        return null;
      }

      return cache[this.filterDescription];

    }else if(this.filterTag){
      return cache[map[this.filterTag]];
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
      new EccosysProvider(true).attributes().go((data) => {
        this._prepare(data);
        callback(this._onResult());
      })
    }else{
      callback(this._onResult());
    }
  }
}
