const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = class AttributesHandler {
  isCached() {
    return CacheAttrs.isCached();
  }

  clearCache(callback) {
    return CacheAttrs.clearCache(callback)
  }

  filter(description, options) {
    this.descriptionOrTag = description;
    this.options = options;

    return this;
  }

  get() {
    if (this.isCached()) {
      return CacheAttrs.filter(this.descriptionOrTag, this.options);
    } else {
      return undefined;
    }
  }

  load(callback, useCache) {
    CacheAttrs.load(useCache, () => {
      if (callback) callback(this.get());
    });

    return this;
  }
};

var CacheAttrs = {
  cache: undefined,
  map: undefined,
  isChanging: false,
  listeners: [],

  clearCache(callback) {
    this.cache = undefined;
    this.map = undefined;
    callback()
  },

  isCached() {
    return this.cache != undefined;
  },

  filter(name, options) {
    if (name) {
      var data = this.cache[name] || this.cache[this.map[name]];

      if (options && Arr.is(data)) {
        return data.filter(each => {
          return options.includes(each.description);
        });
      }

      return data;
    }

    return this.cache;
  },

  _prepare(data) {
    var _cache = {};
    var _map = {};

    data.forEach(each => {
      each.descricao = each.descricao.trim();
      _map[each.idExterno] = each.descricao;
      var options = each._Opcoes ? each._Opcoes[0] : null;

      if (options) {
        // Remove duplicates
        options = Object.fromEntries(
          Object.entries(options).map(a => {
            a[1] = a[1].trim();
            return a.reverse();
          })
        );

        _cache[each.descricao] = Object.keys(options).map(value => {
          return { id: options[value], idAttr: each.id, tag: each.idExterno, description: value };
        });
      } else {
        _cache[each.descricao] = each;
      }
    });

    this.cache = _cache;
    this.map = _map;
  },

  emit() {
    this.listeners.forEach((each, i, arr) => {
      each(this.cache);
    });

    this.listeners = [];
  },

  load(useCache, callback) {
    if (useCache && this.isCached()) {
      callback(this.cache);
    } else {
      this.listeners.push(callback);
      if (!this.isChanging) {
        this.isChanging = true;
        new EccosysProvider().attributes().go(data => {
          this._prepare(data);
          this.isChanging = false;
          this.emit();
        });
      }
    }
  },
};
