const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    const ShippingOrderHandler = require('./src/handler/shipping-order-handler.js');

    new ShippingOrderHandler().updateSaleStatus({ number: '4782' }, () => {
      console.log('terminou');
    });
  });
