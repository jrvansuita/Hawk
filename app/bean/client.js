module.exports = class Client extends DataAccess {

  constructor(id, code, name, tradeName, socialCode, cell, email, lastSale) {
    super();
    this.id = Num.def(id);
    this.code = Num.def(code);
    this.name = Str.def(name);
    this.tradeName = Str.def(tradeName);
    this.socialCode = Str.def(socialCode);
    this.cell = Str.def(cell);
    this.email = Str.def(email);
    this.lastSale = Dat.def(lastSale);
  }

  static getKey() {
    return ['id'];
  }


  static from(c){
    return new Client(
      c.id,
      c.codigo,
      c.nome,
      c.fantasia,
      c.cnpj,
      c.celular,
      c.email,
      c.dataUltimaCompra
    );
  }

  static likeQuery(value){
    var orOption = (field) => {
      var r = {};
      r[field] = {
        "$regex": value,
        "$options": "i"
      };

      return r;
  }

  return {
    $or: [
      orOption('name'),
      orOption('tradeName'),
      orOption('socialCode'),
      orOption('email')
    ]
  };
}

static likeThis(keyValue, limit, callback){
  var query = this.likeQuery(keyValue);

  this.staticAccess()
  .find(query)
  .limit(limit)
  .exec(callback);
}

}
