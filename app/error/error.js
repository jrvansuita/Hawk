

module.exports = class Err{
  constructor(e, user) {
    this.e = e;
    this.type = "Err";
    this.userId = user ? (user.id || user) : undefined;
  }

  toString(){
    return this.e;
  }


  static xprss(e){
    if (e != undefined){
      var message = e.toString();
      if (e instanceof Error){
        message += "\n" + e.stack.split("\n")[1];
      }

      return message;
    }
    return '';
  }

  static thrw(e, user){
    throw new Err(e, user);
  }
};
