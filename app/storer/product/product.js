const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const AttributesStorer = require('./attributes.js');
const ProductBinder = require('./binder.js');

module.exports = class ProductStorer{
  constructor(){
    this.attributesStorer = new AttributesStorer();
  }

  with(data){
    this.binder = ProductBinder.create(data).work();
    return this;
  }

  searchAttr(type, callback){
    this.attributesStorer.filter(type).load(callback);
  }

  insert(callback){
    var storer = new EccosysStorer(true);

    //    storer.product().insert(this.binder).go((productResponse) => {
    //    if (productResponse.result.success.length > 0){
    this.binder.work();
    this.attributesStorer.load(() => {
      storer.product(this.binder.codigo).attrs().put(this.binder.attrs()).go((attributesResponse) => {
        console.log(attributesResponse);
        callback(attributesResponse);
      });
    });
    //  }else{
    //  callback(productResponse);
    //      }
    //  });
  }

  delete(callback){
    new EccosysStorer().product(this.binder.codigo).delete().go(callback);
  }
}
