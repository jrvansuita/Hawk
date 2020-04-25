const DashboardProvider = require('./dashboard-provider.js');

const SaleStock = require('../../bean/sale-stock.js');


var temp = {};

module.exports = class StockDashboardProvider extends DashboardProvider.Handler{

  _getSearchQueryFields(){
    return ['sku', 'size'];
  }

  _onLoadData(callback){
    SaleStock.find(this.getDataQuery(), (err, rows)=>{
      callback(err, this._onParseData(rows));
    });
  }

  _onParseData(rows){
    return new StockDash(rows);
  }

};


class StockDash extends DashboardProvider.Helper{
  constructor(rows){
    super();
    this.count = rows.length;
    this.arrs = {};

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

    });
  }

  finals(){
    this.tkm = this.total/this.items;
    //this.avgItems = this.items/this.count;
    this.profit =  this.total - this.cost;

    //this.avgCost = this.cost/this.items;
    this.markup = this.total / this.cost;
    //this.avgSell = (this.total - this.freight)/this.items;


    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name, 'items');
    });

    delete this.arrs;
  }

  handleCustom(self, item, result){
    result.items = result.items ? result.items + item.quantity : item.quantity;
  }





}
