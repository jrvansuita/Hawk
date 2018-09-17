module.exports = class History extends DataAccess {

  constructor(type, userId, title, message, tag){
    super();
    //1-Info, 2-Error, 3-Notificação
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


  static info(userId, title,  message, tag){
    new History(1, userId, title, message, tag).upsert();
  }

  static error(userId,title, message, tag){
    new History(2, userId, title, message, tag).upsert();
  }

  static notify(userId, title, message, tag){
    new History(3, userId, title, message, tag).upsert((err, doc)=>{
      console.log(err);
      console.log(doc);
    });
  }
};
