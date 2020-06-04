
const Product = require('../bean/product.js');



module.exports = {


  buildQuery(query){
    var attrs = {};
    if (query.attrs){
      for (let [key, value] of Object.entries(query.attrs)) {

        var seachValue = value;

        //Os attrs abaixo podem ter vários valores separadas por vírgula
        //Para todos os outros atributos, tem que ser exatamente o valor para buscar
        if (!['category', 'age'].includes(key)){
          seachValue = '^' + value + '$';
        }

        attrs[key] = {
          '$regex': seachValue,
          '$options': 'i'
        };
      }
    }


    if (query.noQuantity == 'false'){
      //Acima de 0
      attrs.quantity =   {$gt: 0};
    }

    var result = Object.assign(Product.likeQuery(query.value), attrs);

    return result;
  },

  load(query, page, callback){
    if(Array.isArray(query)){
      Product.getBySkus(query, (data) => {
        callback(data);
      });
    }else{
      this.loadByQuery(query, page, callback);
    }
  },

  loadByQuery(query, page, callback){
    if(page == null){
      Product.find(this.buildQuery(query), (err, result) => {
        callback(result);
      });
    }else{
      Product.paging(this.buildQuery(query), page, (err, result)=>{
        callback(result[0].items, result[0].info[0]);
      });
    }
  }
};
