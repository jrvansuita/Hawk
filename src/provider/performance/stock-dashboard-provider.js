const DashboardProvider = require('./dashboard-provider.js');

const SaleStock = require('../../bean/sale-stock.js');

module.exports = class StockDashboardProvider extends DashboardProvider.Handler {
  delete(callback) {
    SaleStock.removeAll(this.getDataQuery(), callback);
  }

  _getSearchQueryFields() {
    return ['sku', 'season', 'manufacturer', 'brand', 'category'];
  }

  _onLoadData(callback) {
    var resume = (err1, chartData) => {
      SaleStock.findAndSort(this.getDataQuery(), 'date', (err2, rows) => {
        callback(err1 || err2, this._onParseData(rows, chartData));
      });
    };

    if (this.getDaysDif() === 0) {
      resume(null, null);
    } else {
      SaleStock.byDayChart(this.getDataQuery(), resume);
    }
  }

  _onParseData(rows, chart, daysCount) {
    return { ...new StockDash(rows, this.query.showSkus, this.query.order), ...{ chart: chart } };
  }
};

class StockDash extends DashboardProvider.Helper {
  constructor(rows, loadSkusCount, order) {
    super();
    this.count = rows.length;
    this.arrs = {};
    this.loadSkusCount = loadSkusCount === undefined ? 25 : loadSkusCount;
    this.order = order;

    this.rolling(rows);
    this.finals();
  }

  rolling(rows) {
    this.total = 0;
    this.items = 0;
    this.cost = 0;
    this.sumScore = 0;
    this.stockCounter = {};
    this.daysCounter = {};

    rows.forEach((each) => {
      this.total += each.total;
      this.items += each.quantity;
      this.cost += each.cost;

      this.stockCounter[each.sku] = each.stock;
      this.daysCounter[Dat.format(each.date)] = true;

      each.score = this.calcScore(each);
      this.sumScore += each.score;

      this.handleArr(each, 'season', this.handleCustom);
      this.handleArr(each, 'gender', this.handleCustom);
      this.handleArr(each, 'category', this.handleCustom);
      this.handleArr(each, 'manufacturer', this.handleCustomManufacturer);
      this.handleArr(each, 'brand', this.handleCustom);

      if (each.quantity_sizes) {
        Object.keys(each.quantity_sizes).forEach((key) => {
          this.handleArr({ size: key, quantity: each.quantity_sizes[key] }, 'size', this.handleCustom);
        });
      }

      if (this.loadSkusCount) {
        this.handleArr(each, 'sku', this.handleCustomSku);
      }
    });
  }

  finals() {
    this.tkm = this.total / this.items;
    this.tkmCost = this.cost / this.items;
    this.profit = this.total - this.cost;
    this.markup = this.total / this.cost;
    this.daysCount = Object.keys(this.daysCounter).length;

    this.sumStock =
      Object.values(this.stockCounter).reduce((count, i) => {
        return count + i;
      }, 0) + this.items;
    delete this.stockCounter;

    this.percSold = (this.items * 100) / this.sumStock;

    this.stockCoverage = (this.sumStock - this.items) / (this.items / this.daysCount);
    this.score = this.sumScore / this.count;
    delete this.sumScore;

    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name, 'items');
    });

    if (this.sku) {
      if (this.order === 'asc') this.sku.reverse();
      this.skusCount = this.sku.length;
      this.sku.splice(this.loadSkusCount);
    }

    delete this.arrs;
  }

  handleCustom(self, item, result) {
    result.items = result.items ? result.items + item.quantity : item.quantity;
  }

  handleCustomManufacturer(self, item, result) {
    result.items = result.items ? result.items + item.quantity : item.quantity;
    result.cost = result.cost ? result.cost + item.cost : item.cost;
    result.sumScore = result.sumScore ? result.sumScore + item.score : item.score;
  }

  handleCustomSku(self, item, result) {
    result.items = result.items ? result.items + item.quantity : item.quantity;
    result.manufacturer = item.manufacturer;
    result.score = result.score ? (result.score + item.score) / 2 : item.score;
    result.stock = item.stock;
  }

  /* - Calculo de score de vendas por quantidade parcial de estoque no dia - */
  calcScore(item) {
    var score = 1;

    if (item.stock > 0) {
      var stockPonder = item.stock / 3;
      var perc = (item.quantity * 100) / stockPonder;
      perc = Num.between(perc, 1, 100);
      var score = (perc * 15) / 100;
    }

    return score;
  }
}
