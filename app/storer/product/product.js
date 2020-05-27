const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');
const AttributesHandler = require('./attributes.js');
const ProductBinder = require('./binder.js');

module.exports = class ProductStorer{
  constructor(){
    this.provider = new EccosysProvider();
    this.storer = new EccosysStorer(false);
  }

  async with(user, data){
    data.user = user;
    this.fatherBody = await ProductBinder.create(data).body();
    return this;
  }

  searchAttr(description, callback){
    new AttributesHandler().filter(description).load(callback);
  }

  setOnFinished(callback){
    this.onFinishListener = () => {
      console.log('Terminate');
      callback();
    }
    return this;
  }

  upsert(){
    //Father Handler
    this._onProductUpsert(this.fatherBody, () => {
      //Childs Handler
      this._handleChildsUpserts();
    });
  }


  _handleChildsUpserts(childs){
    var childs = this.fatherBody.getChilds();
    
    var incrementalUpserts = () => {
      if (childs.length){
        this._onChildProductUpsert(childs[0], () => {
          childs.shift(); incrementalUpserts();
        });
      }else{
        this.onFinishListener();
      }
    }

    incrementalUpserts();
  }

  _onProductUpsert(data, callback){
    console.log('Upsert ' + data.codigo);
    this.storer.product().upsert(data.id == undefined, data).go(response => this._onStoringResponseHandler(data, response, callback));
  }

  _onChildProductUpsert(_data, callback){
    this._onBeforeUpsertChildProduct(_data, (data) => {
      this._onProductUpsert(data, callback);
    });
  }

  _onBeforeUpsertChildProduct(data, callback){
    var sku = data.codigo;
    var isNew = data.id == undefined;
    var isChild = sku.includes('-');

    if (isNew && isChild){
      this.provider.product(sku).go((found) => {
        if (found && found.id) {
          data.id = found.id;
          data.gtin = found.gtin;
        }

        callback(data);
      });
    }else{
      callback(data);
    }
  }

  _onStoringResponseHandler(data, response, callback){
    response = response.result || response;

    console.log(response);
    if (response.success.length > 0){
      data.id = response.success[0].id;
      this._onAttributesHandler(data, callback);
    }else{
      this.onFinishListener(response);
    }
  }

  _onAttributesHandler(data, callback){
    new AttributesHandler().load(() => {
      var attrs =  ProductBinder.create(data).attrs();
      this.storer.product(data.codigo).attrs().put(attrs).go(callback);
    });
  }

  delete(callback){
    new EccosysStorer().product(this.fatherBody.codigo).delete().go(callback);
  }
}
