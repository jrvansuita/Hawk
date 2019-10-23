const PendingHandler = require('../handler/pending-handler.js');
const BlockHandler = require('../handler/block-handler.js');
const EccosysProvider = require('../eccosys_new/eccosys-provider.js');

var productsList = undefined;

module.exports = class {

  constructor(){
    this.results = [];

    if (!productsList){
      productsList = [];
    }
  }

  load(callback){
    PendingHandler.load(false, (pendings)=>{
      BlockHandler.load((blockeds)=>{
        this.blockeds = blockeds;
        this.pendings = pendings;

        this.prepareBlockeds(()=>{
          this.preparePendings(()=>{

            callback(this.results);

          });
        });


      });
    });
  }


  preparePendings(callback){

    var handler = {};

    this.pendings
    .filter((pending)=>{
      return pending.status.toString() == '0';
    }).forEach((pending)=>{

      pending.sale.items.forEach((item)=>{

        if (!handler[item.codigo]){
          handler[item.codigo] = [];
        }

        handler[item.codigo].push(pending.number);
      });
    });

    var skus = Object.keys(handler);


    this._getProducts(skus, (products)=>{
      if (products.length == 0){
        callback();
      }else{
        products.forEach((product, index)=>{

          var data = new DataItem(product)
          .setData(handler[product.codigo].length)
          .setType('pending')
          .setObs(handler[product.codigo].toString());

          this.results.push(data);

          if (index == products.length-1){
            callback();
          }
        });
      }
    });


  }

  prepareBlockeds(callback){
    var skus = this.blockeds.filter(i =>{return i.reasonTag.toString() == '994'}).map(i => {return i.number});

    this._getProducts(skus, (products)=>{
      if (products.length == 0){
        callback();
      }else{
        products.forEach((product, index)=>{
          var block = this.blockeds.find((i)=>{
            return i.number.toLowerCase() == product.codigo.toLowerCase();
          });

          if (block){
            var data = new DataItem(product)
            .setData(block.blockings)
            .setType('block')
            .setIsFather(product._Skus && product._Skus.length);

            this.results.push(data);
          }

          if (index == products.length-1){
            callback();
          }
        });
      }
    });

  }


  _getProducts(skus, callback){
    var result = [];

    for (let index = skus.length - 1; index >= 0; index--) {
      var sku = skus[index];
      var product = productsList[sku];

      if (product){
        result.push(product);
        skus.splice(index, 1);
      }
    }

    if (skus.length > 0){
      new EccosysProvider().skus(skus).go((products)=>{
        if (products.length > 0){
          products.forEach((product)=>{
            productsList[product.codigo] = product;
          });

          result = products.concat(result);
        }

        callback(result);
      });

    }else{
      callback(result)
    }
  }
}


class DataItem{
  constructor(product){
    //Handle the products attirbutes
    product._Atributos.forEach((attr)=>{
      product[attr.descricao] = attr.valor;
    });

    this.sku = product.codigo;
    this.brand = product.Marca;
    this.stock = product._Estoque.estoqueDisponivel;
    this.reserved = product._Estoque.estoqueReal - product._Estoque.estoqueDisponivel;
    this.local = product.localizacao;
    this.isFather = false;
  }

  setIsFather(isFather){
    this.isFather = isFather;
    return this;
  }

  setData(count){
    this.count = count;
    return this;
  }

  setType(type){
    this.type = type;
    return this;
  }

  setObs(obs){
    this.obs = obs;
    return this;
  }
}
