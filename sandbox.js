const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    const GDrive = require('./src/gdrive/gdrive-api')

    var filePath = '/Users/admin/Downloads/Pasta Sem Título/CB701li.png';

    new GDrive().download('1b2WcHMPe6XgEU0etyh6jAywhMnqM1RBF')

    // new GDrive().setMedia('TesteUP', filePath, 'image/png').upload((id) => {
    //   console.log(id);
    // })

    // console.log(Params.getGDriveCredentials());
    // console.log(Params.getGDriveToken());
  });
