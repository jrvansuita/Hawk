const Err = require('../error/error.js');

module.exports = class History extends DataAccess {

  constructor(type, userId, title, message, tag){
    super();
    //1-Info, 2-Error, 3-Notificação, 4-Job/Automation
    this.type = Num.def(type);
    this.tag = Str.def(tag);
    this.userId = Num.def(userId);
    this.title = Str.def(title);
    this.message = Str.def(message);
    this.date = new Date();
  }

  static getKey() {
    return ['date', 'userId', 'tag'];
  }

  static handle(e, userId){
    if (e.type == "Err"){
      History.info(e.userId ? e.userId : userId, 'Aviso de Sistema', Err.xprss(e) , 'Informação');
    }else{
      History.error(e, null, null, userId);
    }
  }

  static info(userId, title,  message, tag){
    new History(1, userId, title, message, tag).upsert();
  }

  static error(e, title, addtoMessage, userId){
    var _userId = userId ? userId : (e.userId ? e.userId : 0);

    console.error(e);
    if (process.env.IS_PRODUCTION){
      new History(2, _userId , title ? title : 'Erro de Sistema', addtoMessage ? addtoMessage + '\n' : '' + Err.xprss(e), 'Falha').upsert();
    }
  }

  static notify(userId, title, message, tag){
    new History(3, userId, title, message, tag).upsert();
  }

  static job(title, message, tag, userId){
    new History(4, userId ? userId : 0, title, message, tag).upsert();
  }
};
