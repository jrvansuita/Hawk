const DashboardProvider = require('./dashboard-provider.js');

const SaleStock = require('../../bean/sale-stock.js');


var temp = {};

module.exports = class StockDashboardProvider extends DashboardProvider.Handler{

  _getSearchQueryFields(){
    return ['sku', 'season', 'manufacturer', 'brand', 'category'];
  }

  _onLoadData(callback){
    SaleStock.byDayChart(this.getDataQuery(), (err1, chartData) => {
      SaleStock.find(this.getDataQuery(), (err2, rows)=>{
        callback(err1 || err2, this._onParseData(rows, chartData));
      });
    });
  }

  _onParseData(rows, chart){
    return {...new StockDash(rows, this.query.showSkus), ...{chart : chart}};
  }

};


class StockDash extends DashboardProvider.Helper{
  constructor(rows, loadSkusCount){
    super();
    this.count = rows.length;
    this.arrs = {};
    this.loadSkusCount = loadSkusCount == undefined ? 25 : loadSkusCount;

    this.rolling(rows);
    this.finals();
  }

  rolling(rows){
    this.total = 0;
    this.items = 0;
    this.cost = 0;

    rows.forEach((each) => {
      this.total += each.total;
      this.items += each.quantity;
      this.cost += each.cost;


      this.handleArr(each, 'season', this.handleCustom);
      this.handleArr(each, 'gender', this.handleCustom);
      this.handleArr(each, 'category', this.handleCustom);
      this.handleArr(each, 'manufacturer', this.handleCustom);
      this.handleArr(each, 'brand', this.handleCustom);

      if (each.quantity_sizes){
        Object.keys(each.quantity_sizes).forEach((key) => {
          this.handleArr({size:key, quantity: each.quantity_sizes[key]}, 'size', this.handleCustom);
        });
      }

      if (this.loadSkusCount){
        this.handleArr(each, 'sku', this.handleCustomSku);
      }

    });
  }

  finals(){
    this.tkm = this.total/this.items;
    this.tkmCost = this.cost/this.items;
    this.profit =  this.total - this.cost;
    this.markup = this.total / this.cost;


    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name, 'items');
    });

    if (this.sku){
      this.sku.splice(this.loadSkusCount);
    }

    delete this.arrs;
  }

  handleCustom(self, item, result){
    result.items = result.items ? result.items + item.quantity : item.quantity;
  }

  handleCustomSku(self, item, result){
    result.items = result.items ? result.items + item.quantity : item.quantity;

    /* - Calculo de score de vendas por quantidade total de estoque no dia - */
    if (item.stock > 0){
      var perc = (item.quantity * 100) / item.stock;

      var score = Num.between(perc, 1, 100) / 10;

      result.score = result.score ? (result.score + score) / 2 : score
    }
    /* ---  */
  }





}
