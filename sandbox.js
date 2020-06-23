const Initilizer = require('./src/_init/initializer.js')

new Initilizer().setSandboxMode(true).begin().then(async () => {
  var value = 10
  const Enum = require('./src/bean/enumerator.js')
  var object = (await Enum.on('PAPERS-ICONS').get(true))

  var result = Object.keys(object).reduce((acc, key) => {
    var arr = key.split('-')
    return acc + (value >= parseInt(arr[0]) && value <= parseInt(arr[1]) ? object[key].icon : '')
  }, '')

  console.log(result)
})
