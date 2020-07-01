const Initilizer = require('./src/_init/initializer.js')

new Initilizer().setSandboxMode(true).begin().then(async () => {
  const Enum = require('./src/bean/enumerator.js')
  // var object = (await Enum.on('COLOR-LIST').mapBy('name').get(true))

  // var s = (await Enum.on('SALE-STATUS').hunt('ip_shipped', 'value'))

  // console.log(s)

  const SaleLoader = require('./src/loader/sale-loader.js')

  new SaleLoader('121048805').run((sale) => {
    console.log(sale)
  })
})
