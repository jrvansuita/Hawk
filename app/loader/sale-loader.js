const EccosysCalls = require('../../eccosys/eccosys-calls.js');

module.exports= class SaleLoader {

  constructor(data){
    this.sale = data;
    this.runs = [];
  }

  loadSale(){
    this.runs.push(loadSale);
    return this;
  }

  loadClient(){
    this.runs.push(loadClient);
    return this;
  }

  loadItems(){
    this.runs.push(loadItems);
    return this;
  }

  _runner(){

  }


  run(callback){

    if (typeof sale !== 'object'){
      this.loadSale(sale, (sale)=>{
        this.sale = sale;
        _runner();
      });
    }else{
        _runner();
    }
  }
};




function loadSale(sale, callback){
  EccosysCalls.getSale(sale, (s)=>{
    callback(s);
  });
}

function loadClient(sale){
  if (sale.idContato && !sale.client){
    EccosysCalls.getClient(sale.idContato, (data)=>{
      var client = JSON.parse(data)[0];
      sale.client = client;
      callback(sale);
    });
  }else{
    callback(sale);
  }
}
