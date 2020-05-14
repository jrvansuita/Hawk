
const Initilizer = require('./app/abra-cadabra/initializer.js');


new Initilizer(__dirname, true).begin(() => {

  const EccosysStorer = require('./app/eccosys/eccosys-storer.js');

  var storer = new EccosysStorer(true);

  var r2 = {
    "id": "126192393",
    //"descricao": "Faixa de Idade",
    valor : "Bebe"
  };

  var r = {
    //descricao: "Fabricante",
    id: "163882126",
    valor: 'Teste'
  }

  var r3 = {
    id: "165229494",
    valor: 'Até 1'
  }

  storer.product('JRTESTE3').attrs().put([r, r2, r3]).go((attributesResponse) => {
    console.log(attributesResponse);

  });

});
