const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {});
