
const Initilizer = require('./app/abra-cadabra/initializer.js');


new Initilizer(__dirname, true).begin(async () => {

  const Enum = require('./app/bean/enumerator.js');

  //var s = (await Enum.on('PROD-DEP-NAME')).hunt('Meia');
  var s = await Enum.on('PROD-DEP-NAME').hunt('Meia');
var s = await Enum.on('PROD-FA-SIZES').hunt('Bebê');

  console.log(s);

});
