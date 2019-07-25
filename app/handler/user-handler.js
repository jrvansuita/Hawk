const User = require('../bean/user.js');
const Err = require('../error/error.js');
const UsersProvider = require('../provider/UsersProvider.js');
const ImgurSaver = require('../imgur/save-image.js');

module.exports = class UserHandler {

  static storeFromScreen(params, callback) {
    var actual = UsersProvider.get(params.id);

    var user = new User(parseInt(params.id),
    params.name,
    params.sector,
    params.avatar || '/img/avatar.png',
    params.access,
    params.full == 'on',
    params.active == 'on',
    params.token ? params.token : actual.token ? actual.token : '',
    params.leader == 'on');

    //Gravando as configurações
    Object.keys(params).forEach((key)=>{
      if (key.includes('sett')){
        var settCode = key.split('-')[1];
        user.setts[settCode] = params[key];
      }
    });

    //Gravando as configurações
    Object.keys(params).forEach((key)=>{
      if (key.includes('menu')){
        user.menus.push(key.split('-')[1]);
      }
    });


    //É um cadastro novo
    if (!user.id){
      delete user.id;
      user.active = true;
    }

    //Se o Usuario não tem permissão para alterar as próprias configurações
    //Todas as configs não serão setadas. Elimitar o atributo setts para não sobreescrever tudo
    if (Object.keys(user.setts).length == 0){
      delete user.setts;
    }
    

    user.upsert((err, doc)=>{
      callback(doc.id);

      user.id = doc.id;
      //toObject removes unwanted attrs
      UsersProvider.addUser(user.toObject());
    });
  }


  static delete(userId){
    User.findByKey(userId, (err, user)=>{
      user.remove();
      UsersProvider.remove(userId);
    });
  }

  static changeImage(userId, base64Image){
    ImgurSaver.upload(base64Image, (data)=>{


      if (data.link){
        console.log(data.link);

        User.updateAvatar(userId, data.link, ()=>{
          var user = UsersProvider.get(userId);

          if (user){
            user.avatar = data.link;

            console.log('Salvou');
            console.log(UsersProvider.get(userId).avatar);
          }
        });
      }else{
        console.log('Erro: ' + data.message);
      }
    });
  }


};
