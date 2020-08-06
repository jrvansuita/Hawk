const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    const GDrive = require('./src/gdrive/gdrive-api')
    const ProductBoard = require('./src/performance/product-board-email')

    new ProductBoard().go((data) => {
      console.log(data);
    })
  });
