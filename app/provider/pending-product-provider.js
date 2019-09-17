const PendingHandler = require('../handler/pending-handler.js');
const BlockHandler = require('../handler/block-handler.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

var loadedResults = undefined;

module.exports = class {

  constructor(){

  }

  load(callback){

    if (!loadedResults){
      loadedResults = [];

      PendingHandler.load(false, (pendings)=>{
        BlockHandler.load((blockeds)=>{
          this.blockeds = blockeds;
          this.pendings = pendings;

          this.prepareBlockeds(()=>{


            callback(loadedResults);

          });


        });
      });
    }else{
      callback(loadedResults);
    }

  }


  prepareBlockeds(callback){
    var skus = this.blockeds.filter(i =>{return i.reasonTag.toString() == '994'}).map(i => {return i.number});

    new EccosysCalls().getSkus(skus, (products)=>{
      products.forEach((product, index)=>{


        var block = this.blockeds.find((i)=>{
          return i.number == product.codigo;
        });

        var data = new DataItem(product)
        .setData(block.blockings, block.user)
        .setType('block')
        .setObs('Teste');

        loadedResults.push(data);


        if (index == products.length-1){
          callback();
        }
      });
    });

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
    this.stock = product._Estoque.estoqueReal;
    this.local = product.localizacao;
  }

  setData(count, user){
    this.user = user;
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
