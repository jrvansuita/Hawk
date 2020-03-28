
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

    this.rolling(rows);
    this.finals();
  }

  rolling(rows){
    this.total = 0;
    this.items = 0;
    this.cost = 0;
    this.freight = 0;
    this.discount = 0;

    rows.forEach((each) => {
      this.total += each.total;
      this.items += each.quantityItems;
      this.cost += each.productCost;
      this.freight += each.freightValue;
      this.discount += each.discount || 0;

      this.handleArr(each, 'uf');
      this.handleArr(each, 'paymentType');


      if (each.coupom){
        this.handleArr(each, 'coupom');
      }
    });
  }

  finals(){
    this.tkm = this.total/this.count;
    this.avgItems = this.items/this.count;
    this.avgUnit = this.total/this.items;
    this.profit =  this.total - (this.freight + this.cost);

  }

  handleArr(each, name){
    if (!this[name]){
      this[name] = {};
    }
    var key = each[name] || 'Indefinido';


    var that = this[name][key] || {};

    that.count = that.count ? that.count + 1 : 1;
    that.total = that.total ? that.total + each.total : each.total;
    this[name][key] = that;
  }




}
