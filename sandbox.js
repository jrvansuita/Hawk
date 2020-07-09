const Initilizer = require('./src/_init/initializer.js')

new Initilizer().setSandboxMode(true).begin().then(async () => {
  // const Enum = require('./src/bean/enumerator.js')
  const ProductBoard = require('./src/performance/product-board-email.js')

  // var s = (await Enum.on('TRANSPORT-IMGS').mapBy('value').get(true))

  new ProductBoard().go((data) => {
    console.log(data)
  })
})
