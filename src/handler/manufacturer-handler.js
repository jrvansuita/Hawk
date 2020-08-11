const EccosysProvider = require('../eccosys/eccosys-provider.js');

var cache;

module.exports = class ManufacturerHandler {
  _prepare(data) {
    cache = data.reduce((acc, each) => {
      return { ...acc, [each.nome]: each.id };
    }, {});
  }

  _filter(name) {
    return name ? cache[name.trim()] : cache;
  }

  get(name) {
    return new Promise((resolve, reject) => {
      if (cache) {
        resolve(this._filter(name));
      } else {
        new EccosysProvider()
          .manufacturers()
          .setOnError(reject)
          .go(data => {
            this._prepare(data);
            resolve(this._filter(name));
          });
      }
    });
  }
};
