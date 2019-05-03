const Product = require('../bean/product.js');
const Fix = require('../bean/fix.js');


module.exports = class DiagnosticsProvider{
  constructor(){

  }


  groupType(data){
    var grouped = {};

    data.forEach((item)=>{
      var skuFather = item.sku.split('-')[0];


      if (!grouped[skuFather]){
      var isChild = item.sku.includes('-');

        grouped[skuFather] = {
          sku : skuFather,
          type: item.type,
          name: Util.getProductName(item.name, isChild),
          brand: Util.getProductBrand(item.name, isChild),
        };
      }
    });



    return Object.values(grouped);
  }

  loadByType(type, callback){
    Fix.findByType(type, (err, all)=>{
      callback(this.groupType(all));
    });
  }


  groupSku(data){
    var grouped = {};


    data.forEach((item)=>{

      if (!grouped[item.sku]){
         grouped[item.sku] = {sku: item.sku, fixes: [item.type]};
      }else{
        grouped[item.sku].fixes.push(item.type);
      }
    });

    return Object.values(grouped);
  }

  loadBySku(sku, callback){
    Product.get(sku, (product)=>{
      Fix.findBySku(sku, (err, all)=>{
        callback(this.groupSku(all), product);
      });
    });

  }

  sums(callback){
    Fix.sums((err, res)=>{
      callback(res);
    });
  }
}
