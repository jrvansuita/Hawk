const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');
const AttributesStorer = require('./attributes.js');
const ProductBinder = require('./binder.js');

module.exports = class ProductStorer{
  constructor(){
    this.provider = new EccosysProvider();
    this.storer = new EccosysStorer();
    this.attributesStorer = new AttributesStorer();
  }

  with(data){
    this.binder = ProductBinder.create(data).work();
    return this;
  }

  searchAttr(type, callback){
    this.attributesStorer.filter(type).load(callback);
  }

  upsert(callback){
    this.onFinishListener = callback;
    this.provider.product(this.binder.codigo).go(found => this._onHandleProductFind(found) );
  }

  _onHandleProductFind(found){
    this.storer.product().upsert(found && found.codigo, this.binder).go(response => this._onStoringResponseHandler(response));
  }

  _onStoringResponseHandler(response){
    console.log(response);
    response = response.result || response;
    if (response.success.length > 0){
      this._onAttributesHandler();
    }else{
      this.onFinishListener(response);
    }
  }

  _onAttributesHandler(){
    this.attributesStorer.load(() => {
      this.storer.product(this.binder.codigo).attrs().put(this.binder.attrs()).go((response) => {
        console.log(response);
        this.onFinishListener(response);
      });
    });
  }

  delete(callback){
    new EccosysStorer().product(this.binder.codigo).delete().go(callback);
  }
}
