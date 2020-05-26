const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');



module.exports = class AttributesHandler {

  isCached(){
    return CacheAttrs.isCached();
  }

  filter(description, option){
    this.descriptionOrTag = description;
    this.option = option;

    return this;
  }

  get(){
    if (this.isCached()){
      return CacheAttrs.filter(this.descriptionOrTag, this.option);
    }else{
      return undefined;
    }
  }

  load(callback){
    CacheAttrs.load(() => {
      if (callback) callback(this.get());
    });

    return this;
  }
}



var CacheAttrs = {
  cache: undefined,
  map: undefined,
  isChaching: false,
  listeners: [],

  isCached(){
    return this.cache != undefined;
  },

  filter(name, option){
    if (name){

      var data = this.cache[name] || this.cache[this.map[name]];

      if (option && Arr.is(data)){
        return data.find((each) => {
          return each.description == option;
        });
      }

      return data;
    }

    return this.cache;
  },

  _prepare(data){
    var _cache = {};
    var _map = {};

    data.forEach((each) => {
      each.descricao = each.descricao.trim();
      _map[each.idExterno] = each.descricao;
      var options = each._Opcoes ? each._Opcoes[0] : null;

      if (options){
        //Remove duplicates
        options = Object.fromEntries(Object.entries(options).map(a => {a[1] = a[1].trim(); return a.reverse()}))

        _cache[each.descricao] = Object.keys(options).map((value) => {
          return {id: options[value], idAttr: each.id, tag: each.idExterno, description: value};
        });
      }else{
        _cache[each.descricao] = each;
      }
    });

    this.cache = _cache;
    this.map = _map;
  },

  emit(){
    this.listeners.forEach((each, i, arr) => {
      each(this.cache);
    });

    this.listeners = [];
  },

  load(callback){
    if (this.isCached()){
      callback(this.cache);
    }else {
      this.listeners.push(callback);
      if (!this.isChaching){
        this.isChaching = true;
        new EccosysProvider().attributes().go((data) => {
          this._prepare(data);
          this.isChaching = false;
          this.emit();
        });
      }
    }
  }
}
