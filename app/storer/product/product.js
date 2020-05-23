const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');
const AttributesLoader = require('./attributes.js');
const ProductBinder = require('./binder.js');

module.exports = class ProductStorer{
  constructor(){
    this.provider = new EccosysProvider();
    this.storer = new EccosysStorer(false);
  }

  with(data){
    this.fatherBody = ProductBinder.create(data).body();
    return this;
  }

  searchAttr(description, callback){
    AttributesLoader.filter(description).load(callback);
  }

  setOnFinished(callback){
    this.onFinishListener = callback;
    return this;
  }

  upsert(){
    console.log('Upsert ' + this.fatherBody.codigo);
    //Father Handler
    this._onSkuUpsert(this.fatherBody, () => {
      //Childs Handler
      this._handleChildsUpsert();
    });
  }

  _handleChildsUpsert(){
    var childs = this.fatherBody.getChilds();
    var index = -1;

    if (childs && childs.length > 0){
      var handlerFunction = (onFinished) => {
        index++;
        if (index == childs.length){
          onFinished();
        }else{
          console.log('Upsert ' + childs[index].codigo);
          this._onSkuUpsert(childs[index], () => {
            handlerFunction(onFinished);
          });
        }
      }

      handlerFunction(this.onFinishListener);
    }else{
      this.onFinishListener();
    }
  }

  _onSkuUpsert(data, callback){
    this.storer.product().upsert(data.id == undefined, data).go(response => this._onStoringResponseHandler(data, response, callback));
  }

  _onStoringResponseHandler(data, response, callback){
    response = response.result || response;
    console.log(response);
    if (response.success.length > 0){
      this._onAttributesHandler(data, callback);
    }else{
      this.onFinishListener(response);
    }
  }

  _onAttributesHandler(data, callback){
    var attrs = ProductBinder.create(data).attrs()

    //Ainda não ta pronto a atualização de atributos
    AttributesLoader.load(() => {
      this.storer.product(data.codigo).attrs().put(attrs).go((response) => {
        callback(response);
      });
    });
  }

  delete(callback){
    new EccosysStorer().product(this.fatherBody.codigo).delete().go(callback);
  }
}
