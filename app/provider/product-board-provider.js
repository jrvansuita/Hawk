

const Product = require('../bean/product.js');

var loadedResults = undefined;

module.exports = {
  run(callback)
  {
    callback(this.order(r));
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
    var attrs = ['brand', 'category', 'color', 'gender', 'year', 'age', 'season'];


    Product.findAll((err, all) =>{

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
              }else{
                if (!result[attr]){
                  result[attr]={};
                }

                result[attr][eachValue] = {
                  title: eachValue,
                  quantity : each.quantity,
                  count : 1
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