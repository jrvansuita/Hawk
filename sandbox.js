const Initilizer = require('./src/_init/initializer.js')

new Initilizer().setSandboxMode(false).begin().then(() => {
  // const Enum = require('./app/bean/enumerator.js')
  // var s = (await Enum.on('PROD-DEP-NAME')).hunt('Meia');
  // console.log(s)
})
