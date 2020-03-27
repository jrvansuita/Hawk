
const Sale = require('../bean/sale.js');



module.exports = {


  buildQuery(query){
    var result = {};


    if (query.begin || query.end){
      result['date'] = {
        $gte: new Date(parseInt(query.begin)).begin(),
        $lte: new Date(parseInt(query.end)).end()
      };
    }

    if (query.value){
      result = {...result , ...Sale.likeQuery(query.value)};
    }
    console.log(result);

    return result;
  },


  buildResult(data){


    


    return data;
  },

  load(query, callback){
    Sale.find(this.buildQuery(query), (err, result)=>{
      callback(this.buildResult(result));
    });
  },


};
