const Product = require('../../bean/product.js');
const DashboardProvider = require('../performance/dashboard-provider.js');

module.exports = class ProductBoardProvider extends DashboardProvider.Handler {
  _getSearchQueryFields() {
    return ['sku', 'season', 'manufacturer', 'brand', 'category'];
  }

  _onLoadData(callback) {
    console.log(JSON.stringify(this.getDataQuery()));
    Product.findAndSort(this.getDataQuery(), 'quantity', (_err, data) => {
      callback(_err, new ProductBoardHelper(data, this.query.showSkus));
    });
  }
};

class ProductBoardHelper extends DashboardProvider.Helper {
  constructor(data, loadSkusCount) {
    super();
    this.loadSkusCount = loadSkusCount || 25;
    this.prepare(data);
    this.finals();
  }

  prepare(data) {
    this.value = 0;
    this.total = 0;
    this.cost = 0;
    this.skusCount = data?.length;
    this.arrs = {};

    this.smallestCost = data?.[0]?.cost ?? 0;
    this.greaterCost = data?.[0]?.cost ?? 0;
    this.smallestPrice = data?.[0]?.price ?? 0;
    this.greaterPrice = data?.[0]?.price ?? 0;

    data?.forEach(each => {
      each.total = each.quantity;
      this.total += each.total;

      each.value = each.quantity * each.price;
      this.value += each.value;

      this.cost += each.quantity * each.cost;

      this.handleArr(each, 'season', this.handleCustom);
      this.handleArr(each, 'category', this.handleCustom);
      this.handleArr(each, 'brand', this.handleCustom);
      this.handleArr(each, 'color', this.handleCustom);
      this.handleArr(each, 'manufacturer', this.handleCustom);
      this.handleArr(each, 'gender', this.handleCustom);
      this.handleArr(each, 'year', this.handleCustom);
      this.handleArr(each, 'sku', this.handleCustomSku);

      this.handleCustomTotals(each);
    });

    Object.keys(this.arrs).forEach(name => {
      this.objectToArr(name, 'total');
    });

    if (this.sku) {
      if (this.order === 'asc') this.sku.reverse();
      this.skusCount = this.sku.length;
      this.sku.splice(this.loadSkusCount);
    }

    delete this.arrs;
    return this;
  }

  finals() {
    this.tkm = this.value / this.total;
    this.tkmCost = this.cost / this.total;
    this.profit = this.value - this.cost;
    this.markup = this.value / this.cost;
  }

  handleCustomTotals(item) {
    if (item.cost < this.smallestCost) this.smallestCost = item.cost;
    if (item.cost > this.greaterCost) this.greaterCost = item.cost;
    if (item.price < this.smallestPrice) this.smallestPrice = item.price;
    if (item.price > this.greaterPrice) this.greaterPrice = item.price;
    return this;
  }

  handleCustomSku(self, item, result) {
    result.manufacturer = item.manufacturer;
  }

  handleCustom(self, item, result) {
    result.balance = result.balance ? result.balance + item.newStock : item.newStock;
  }
}
