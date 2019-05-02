
var fixEnum = {
  PHOTO: 0, // Foto faltando
  LOCAL: 1, // Localização faltando
  WEIGHT: 2, // Peso faltando
  SALE: 3, //Não vendeu o produto
  BRAND: 4, //Sem marca
  COLOR: 5, //Sem cor
  COST: 6, //Sem preço de custo
  DEPARTMENT: 7, //Departamento faltando
  GENDER: 8, //Gênero faltando


}


module.exports = class Fix extends DataAccess {


  constructor(sku, name, type) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.type = Num.def(type);
    this.date = new Date();
  }

  static enum(){
    return fixEnum;
  }

  static findByType(type, callback){
    Fix.find({type : type}, callback);
  }

  static findBySku(sku, callback){
    var regexp = new RegExp("^"+ sku);
    Fix.find({sku : regexp}, callback);
  }

  static put(product, type){
    new Fix(product.codigo, product.nome, type).upsert();
  }


  static getKey() {
    return ['sku', 'type'];
  }


  static sums(callback){
    Fix.aggregate([{
      $group: {
        _id: {
          type: "$type",
        },
        sum_count: {
          $sum: 1
        }
      }
    }],
    function(err, res) {
      if (callback)
      callback(err, res);
    });
  }


};
