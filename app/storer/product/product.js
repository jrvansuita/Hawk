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

  setOnFinished(callback){
    this.onFinishListener = callback;
    return this;
  }

  upsert(){
    //Faz o pai
    this._onSkuUpsert(this.binder, () => {
      this._handleChildsUpsert();
    });

    //this.provider.product(this.binder.codigo).go(found => this._onHandleProductFind(found) );
  }

  _handleChildsUpsert(){
    var childs = this.binder.getChilds();
    var index = -1;

    if (childs && childs.length > 0){
      var handlerFunction = (onFinished) => {
        index++;
        if (index == (childs.length-1)){
          onFinished();
        }else{
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
    this.storer.product().upsert(data.id == undefined, data).go(response => this._onStoringResponseHandler(response, callback));
  }

  _onStoringResponseHandler(response, callback){
    response = response.result || response;
    if (response.success.length > 0){
      this._onAttributesHandler(callback);
    }else{
      this.onFinishListener(response);
    }
  }

  _onAttributesHandler(callback){
    callback();

    //Ainda não ta pronto a atualização de atributos
    /*this.attributesStorer.load(() => {
      this.storer.product(this.binder.codigo).attrs().put(this.binder.attrs()).go((response) => {
        callback(response);
      });
    });*/
  }

  delete(callback){
    new EccosysStorer().product(this.binder.codigo).delete().go(callback);
  }
}
