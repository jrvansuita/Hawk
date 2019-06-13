
var fixEnum = {
  NO_PHOTO: 0, // Foto faltando
  REGISTERING: 10, // Produto em fase de cadastro

  NO_LOCAL_HAS_STOCK: 1, // Localização faltando mais o produto tem estoque
  HAS_LOCAL_NO_STOCK: 9, // Tem Localização mais o produto nunca teve nenhum lançamento de estoque



  WEIGHT: 2, // Peso faltando
  SALE: 3, //Não vendeu o produto
  BRAND: 4, //Sem marca
  COLOR: 5, //Sem cor
  COST: 6, //Sem preço de custo
  DEPARTMENT: 7, //Departamento faltando
  GENDER: 8, //Gênero faltando ou errado
  MAGENTO_PROBLEM: 11, //Ou nao vem no feed ou Sem stock no magento


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
