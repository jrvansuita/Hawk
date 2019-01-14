module.exports = class Pack extends DataAccess {

  constructor(id, name, height, width, length) {
    super();
    this.id = Num.def(id, 0);
    this.name = Str.def(name, 'Pacote Genérico');
    this.width = Num.def(width);
    this.height = Num.def(height);
    this.length = Num.def(length);
  }


  static getKey() {
    return ['id'];
  }

};
