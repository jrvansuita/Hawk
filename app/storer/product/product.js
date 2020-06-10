const EccosysStorer = require('../../eccosys/eccosys-storer.js');
const EccosysProvider = require('../../eccosys/eccosys-provider.js');
const AttributesHandler = require('./attributes.js');
const ProductBinder = require('./binder.js');
const Product = require('../../bean/product.js');

module.exports = class ProductStorer{
  constructor(){
    this.provider = new EccosysProvider();
    this.storer = new EccosysStorer();
  }

  async with(user, data){
    data.user = user;
    this.fatherBody = await ProductBinder.create(data).body();
    this.storer.withUser(user);
    return this;
  }

  searchAttr(description, callback){
    new AttributesHandler().filter(description).load(callback);
  }

  setOnFinished(callback){
    this.onFinishListener = () => {
      this._sendBroadcastMessage(this.fatherBody);
      callback();
    }
    return this;
  }

  upsert(){
    this._onProductUpsert(this.fatherBody, () => {
      this._handleChildsUpserts(() => {
        this.onFinishListener();
        this.syncUpsertedProduct(this.fatherBody);
      });
    });
  }

  _handleChildsUpserts(callback){
    var childs = this.fatherBody.getChilds();

    var incrementalUpserts = () => {
      if (childs.length){
        this._onChildProductUpsert(childs[0], () => {
          childs.shift(); incrementalUpserts();
        });
      }else{
        callback();
      }
    }

    incrementalUpserts();
  }

  _onProductUpsert(data, callback){
    this._sendBroadcastMessage(data, 'produto');
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

    if (response.success.length > 0){
      data.id = response.success[0].id;
      this._onAttributesHandler(data, callback);
    }else{
      this._sendBroadcastMessage(null, null, response);
      this.onFinishListener(response);
    }
  }

  _onAttributesHandler(data, callback){
    this._sendBroadcastMessage(data,'atributos do produto');

    new AttributesHandler().load(() => {
      var attrs =  ProductBinder.create(data).attrs();

      //Fast Callback
      if (callback) callback();

      this.storer.product(data.codigo).attrs().put(attrs).go(() => {
        //Skip Waiting for this callback
      });
    });
  }

  syncUpsertedProduct(binder){
    new Product(
      binder.codigo,
      binder.nome,
      binder.Marca,
      binder.urlEcommerce,
      binder.imf,
      binder.preco,
      binder.precoDe,
      binder.precoCusto,
      binder.discount,
      binder.Departamento,
      binder.Genero,
      binder.Cor,
      0,
      0,
      true,
      binder.faixa_de_idade,
      binder['Coleção'],
      binder.Estacao,
      binder.Fabricante,
      false,
      binder.getChild('codigo').join(','),
      binder.getChild('peso').join(',')
    ).upsert();
  }

  delete(callback){
    new EccosysStorer().product(this.fatherBody.codigo).delete().go(callback);
  }

  _sendBroadcastMessage(data, msg, error){
    global.io.sockets.emit('storing-product-'+this.fatherBody.codigo, {
      isLoading: !error && msg,
      sku: data.codigo,
      msg : msg ? (data.id ? 'Atualizando ' : 'Criando ') + msg + ' ' + data.codigo : null,
      error: error,
      success: !error && !msg
    });
  }
}
