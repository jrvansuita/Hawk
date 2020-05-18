const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');

var cache;

module.exports = class AttributesStorer{
  constructor(){

  }

  isCached(){
    return cache != undefined;
  }

  filter(type, description){
    this.type = type;
    this.description = description;
    return this;
  }

  _prepare(data){
    cache = {};

    data.forEach((each) => {
      var items = [];

      if (each._Opcoes && each._Opcoes.length == 1){
        Object.keys(each._Opcoes[0]).forEach((key) => {
          items.push({/*id: key*/ id: each.id, description: each._Opcoes[0][key]});
        })
      }

      //Mudei para a própria Descrição para reduzir código
      //cache[each.idExterno] = items;
      cache[each.descricao] = items;
    });
  }

  _onResult(){
    var result = cache;

    if (this.type){
      if (this.description){
        var arr = cache[this.type];
        if (arr != undefined){
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].description == this.description){
              return arr[i];
            }
          }
        }

        return null;
      }

      return cache[this.type];
    }

    return result;
  }

  get(){
    if (this.isCached()){
      return this._onResult();
    }else{
      return undefined;
    }
  }


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
