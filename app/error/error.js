

module.exports = class Err{
  constructor(e) {
    this.e = e;
    this.type = "Err";
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

  static thrw(e){
    throw new Err(e);
  }
};
