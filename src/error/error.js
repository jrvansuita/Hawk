module.exports = class Err {
  constructor(e, user) {
    this.e = e;
    this.type = 'Err';
    this.userId = user ? user.id || user : undefined;
    this.showLines = 45; // 5;
  }

  toString() {
    return this.e;
  }

  static xprss(e) {
    if (e) {
      var message = e.toString();
      if (e instanceof Error) {
        message += '\n' + e.stack.split('\n').slice(1, this.showLines).join('\n');
      }

      return message;
    }
    return '';
  }

  static thrw(e, user) {
    throw new Err(e, user);
  }
};
