require('./app/init/init.js');


const EccosysCalls = require('./app/eccosys/eccosys-calls.js');

console.log(' --------------  ');

var body = {
  situacao: 3,
  numeroPedido: "220142",
  pickingRealizado: "N"
}; 

EccosysCalls.getSale('220142', (asale)=>{
  console.log('pickingRealizado: ' + asale.pickingRealizado);
  console.log('situacao: ' + asale.situacao);


EccosysCalls.updateSale([body], (r)=>{
  console.log(r);

  EccosysCalls.getSale('220142', (sale)=>{
    console.log('pickingRealizado: ' + sale.pickingRealizado);
    console.log('situacao: ' + sale.situacao);
  });

});

});
