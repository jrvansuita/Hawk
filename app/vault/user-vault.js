const User = require('../bean/user.js');
const Err = require('../error/error.js');
const UsersProvider = require('../provider/user-provider.js');
const ImgurSaver = require('../imgur/save-image.js');

module.exports = class  {

  static storeFromScreen(params, callback) {
    var actual = UsersProvider.get(params.id);

    var token = params.token;

    if (!token){
      token = actual && actual.token ? actual.token : ''
    }

    var user = new User(parseInt(params.id),
    params.name,
    params.sector,
    params.avatar || (actual ? actual.avatar : '/img/avatar.png'),
    params.access,
    params.full == 'on',
    params.active == 'on',
    token,
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


  static delete(userId, callback){
    User.findByKey(userId, (err, user)=>{
      user.remove();
      UsersProvider.remove(userId);
      callback();
    });
  }

  static active(userId, active, callback){
    User.upsert({id: userId}, {active : active},(err, user)=>{
      var user = UsersProvider.get(userId);

      if (user){
        user.active = active;
      }

      callback(user);
    });

  }


  static changeImage(userId, base64Image, callback){
    ImgurSaver.upload(base64Image, (data)=>{


      if (data.link){
        callback(data.link);

        User.updateAvatar(userId, data.link, ()=>{
          var user = UsersProvider.get(userId);

          if (user){
            user.avatar = data.link;
          }
        });
      }else{
        //Err.thrw('ImgurSaver: ' +  data.message, userId);
        callback(null);
      }
    });
  }


};
