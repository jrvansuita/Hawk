

const Product = require('../bean/product.js');

var loadedResults = undefined;

module.exports = {
  run(callback)
  {
    callback(this.order(r));
  },

  reset(){
    loadedResults = undefined;
    this.run(()=>{
      global.io.sockets.emit('product-board-reset', {});
    });
  },

  order(result){
    Object.keys(result).forEach((attr)=>{
      var arr = [];

      Object.keys(result[attr]).forEach((key)=>{
        arr.push(result[attr][key]);
      });

      result[attr] = arr.sort((a, b)=>{
        return b.quantity - a.quantity;
      });
    });


    return result;
  },

  load(callback){
    var result = {};
    var attrs = ['brand', 'category', 'color', 'gender', 'year', 'age', 'season', 'manufacturer'];
    var query = {quantity : {$gt: 0}};


    Product.find(query,
      (err, all) =>{

      all.forEach((each)=>{
        attrs.forEach(attr=>{
          var attrValue = each._doc[attr];

          attrValue = attrValue ? attrValue.toLowerCase().trim() : false;

          if (attrValue){
            attrValue.split(',').forEach((eachValue)=>{
              eachValue = eachValue.trim();

              if (result[attr] && result[attr][eachValue]){
                result[attr][eachValue].quantity += each.quantity;
                result[attr][eachValue].count++;
                result[attr][eachValue].balance += each.newStock;
              }else{
                if (!result[attr]){
                  result[attr]={};
                }

                result[attr][eachValue] = {
                  title: eachValue,
                  quantity : each.quantity,
                  count : 1,
                  balance: each.newStock

                };
              }

            });


          }
        });
      });
      callback(this.order(result));
    });



  },


  run(callback){
    if (!loadedResults){
      this.load((results)=>{
        loadedResults = results;
        callback(results);
      });
    }else{
      callback(loadedResults);
    }
  }
};
