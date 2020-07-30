const Product = require('../bean/product.js');
const Fix = require('../bean/fix.js');
const Enum = require('../bean/enumerator.js');

module.exports = class DiagnosticsProvider {
  groupped(s) {
    this.doGroups = s;
    return this;
  }

  loadTypes(s) {
    this.doLoadTypes = s;
    return this;
  }

  groupType(data) {
    var grouped = {};

    data.forEach(item => {
      var skuFather = item.sku.split('-')[0];

      if (!grouped[skuFather]) {
        var isChild = item.name.split('-').length > 2;

        grouped[skuFather] = {
          sku: skuFather,
          type: item.type,
          name: Util.getProductName(item.name, isChild),
          brand: item.brand || Util.getProductBrand(item.name, isChild).trim(),
          manufacturer: item.manufacturer,
        };
      }
    });

    return Object.values(grouped);
  }

  loadByType(type, callback) {
    Fix.findByType(type, (_err, all) => {
      callback(this.groupType(all));
    });
  }

  async _groupFixesType(data) {
    var grouped = {};
    var fixesTypes = await Enum.on('PROD-DIAG').get(true);

    data.forEach(item => {
      if (!grouped[item.sku]) {
        grouped[item.sku] = { sku: item.sku, fixes: [fixesTypes[item.type]] };
      } else {
        grouped[item.sku].fixes.push(fixesTypes[item.type]);
      }
    });

    return Object.values(grouped);
  }

  async prepare(data) {
    if (this.doGroups) {
      data = await this._groupFixesType(data);
    }
    return data;
  }

  loadBySku(sku, callback) {
    Product.get(sku, product => {
      Fix.findBySku(sku, async (_err, data) => {
        callback(await this.prepare(data), product);
      });
    });
  }

  findBySku(sku, callback) {
    Fix.findBySku(sku, async (_err, data) => {
      callback(await this.prepare(data));
    });
  }

  sums(callback) {
    Fix.sums(async (_err, data) => {
      callback(data, await Enum.on('PROD-DIAG').get(true));
    });
  }
};
