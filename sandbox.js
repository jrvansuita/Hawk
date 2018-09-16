require('./app/init/init.js');

const EccosysCalls = require('./app/eccosys/eccosys-calls.js');


EccosysCalls.getClient(251875553, (data)=>{
  var client = JSON.parse(data)[0];
  console.log(client);
});
