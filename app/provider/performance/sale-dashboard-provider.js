const DashboardProvider = require('./dashboard-provider.js');
const Sale = require('../../bean/sale.js');
const Cost = require('../../bean/cost.js');

var temp = {};

module.exports = class SaleDashboardProvider  extends DashboardProvider.Handler{

  _getSearchQueryFields(){
    return ['uf', 'paymentType', 'transport'];
  }

   _onLoadData(callback){
     Cost.getRange(this.query.begin, this.query.end, (err1, costs) => {
       Sale.find(this.getDataQuery(), (err2, rows)=>{
         callback(err1 || err2, this._onParseData(rows, costs));
       });
     });
   }

   _onParseData(rows, costs){
     return new SaleDash(rows, costs);
   }

};


class SaleDash extends DashboardProvider.Helper{
  constructor(rows, costs){
    super();
    this.costs = costs;
    this.count = rows.length;
    this.arrs = {};

    this.rolling(rows);
    this.finals();
  }

  rolling(rows){
    this.total = 0;
    this.items = 0;
    this.cost = 0;
    this.freight = 0;
    this.discount = 0;
    this.repurchaseCount = 0;
    this.weight = 0;

    rows.forEach((each) => {
      this.total += each.total;
      this.items += each.quantityItems;
      this.cost += each.productCost;
      this.freight += each.freightValue;
      this.discount += each.discount || 0;
      this.repurchaseCount += each.repurchase ? 1 : 0;
      this.weight += each.weight || 0;
      //      console.log('Sale ' + each.number + ' - ' +  each.freightValue);

      this.handleArr(each, 'uf');
      this.handleArr(each, 'paymentType');


      if (each.freightValue > 0){
        this.handleArr(each, 'transport', this.handleCustomTransport);
      }


      if (this.includesCoupom(each.coupom)){
        this.handleArr(each, 'coupom');
      }

      if (each.city){
        this.handleArr(each, 'city');
      }
    });
  }

  finals(){
    this.tkm = this.total/this.count;
    this.avgItems = this.items/this.count;
    this.profit =  this.total - (this.freight + this.cost);

    this.avgCost = this.cost/this.items;
    this.markup = (this.total - this.freight) / this.cost;
    this.avgSell = (this.total - this.freight)/this.items;

    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name);
    });

    if (this.city){
      this.city.splice(15);
    }

    delete this.arrs;
  }


  handleCustomTransport(self, item, result){
    if (!result.minDT || (result.minDT > item.deliveryTime)){
      result.minDT = item.deliveryTime;
    }

    if (!result.maxDT || (result.maxDT < item.deliveryTime)){
      result.maxDT = item.deliveryTime;
    }

    result.countDT = result.countDT ? result.countDT + item.deliveryTime : item.deliveryTime;

    self.transportSummary = self.transportSummary || {}
    self.transportSummary.countDT = self.transportSummary.countDT ? self.transportSummary.countDT + item.deliveryTime : item.deliveryTime;

    if (!result.minValue || (result.minValue > item.freightValue)){
      result.minValue = item.freightValue;
    }

    if (!result.maxValue || (result.maxValue < item.freightValue)){
      result.maxValue = item.freightValue;
    }

    result.totalValue = result.totalValue ? result.totalValue + item.freightValue : item.freightValue;

    self.transportSummary.totalValue = self.transportSummary.totalValue ? self.transportSummary.totalValue + item.freightValue : item.freightValue;
  }

  includesCoupom(text){
    return ((text.length > 0) && (!/PEN|TRC/.test(text)));
  }
}
