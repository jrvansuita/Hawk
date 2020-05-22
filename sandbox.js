
const Initilizer = require('./app/abra-cadabra/initializer.js');


new Initilizer(__dirname, true).begin(() => {

  const ProductBoardEmailHandler = require('./app/performance/product-board-email.js');
  const ProductClone = require('./app/bean/product-clone.js');

  new ProductBoardEmailHandler().go((res) => {
    console.log(res);
  });

});
