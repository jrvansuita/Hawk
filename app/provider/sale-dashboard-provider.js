
const Sale = require('../bean/sale.js');



module.exports = {


  buildQuery(query){
    var result = {};

    query.begin = query.begin ? query.begin : Dat.firstDayOfMonth().getTime();
    query.end = query.end ? query.end : Dat.today().getTime();

    result['date'] = {
      $gte: new Date(parseInt(query.begin)).begin(),
      $lte: new Date(parseInt(query.end)).end()
    };

    if (query.value){
      result = {...result , ...Sale.likeQuery(query.value)};
    }

    return result;
  },


  buildResult(rows){
    return new SaleDash(rows);
  },

  load(query, callback){
    Sale.find(this.buildQuery(query), (err, result)=>{
      callback(this.buildResult(result));
    });
  },


};


class SaleDash{
  constructor(rows){
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

      this.handleArr(each, 'uf');
      this.handleArr(each, 'paymentType');
      this.handleArr(each, 'transport', this.handleCustomTransport);

      if (each.coupom){
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
    this.avgUnit = this.total/this.items;
    this.profit =  this.total - (this.freight + this.cost);

    Object.keys(this.arrs).forEach((name) => {
      this.objectToArr(name);
    });

    this.city.splice(15);

    delete this.arrs;
  }

  objectToArr(name){
    if (this[name]){
      this[name] = Object.values(this[name]).sort((a, b) => b.count - a.count);
    }
  }

  handleArr(each, name, onCustom){
    this.arrs[name] = true;

    if (!this[name]){
      this[name] = {};
    }
    var key = each[name] || 'Indefinido';

    var result = this[name][key] || {};

    result.name = key;
    result.count = result.count ? result.count + 1 : 1;
    result.total = result.total ? result.total + each.total : each.total;

    if (onCustom){
      onCustom(this, each, result);
    }

    this[name][key] = result;
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





}
