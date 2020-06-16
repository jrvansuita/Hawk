const Initilizer = require('./src/_init/initializer.js')

new Initilizer().setSandboxMode(false).begin().then(async () => {
  const Enum = require('./src/bean/enumerator.js')
  var s = (await Enum.on('BOARD-GENDER').get(true))
  console.log(s)
})
