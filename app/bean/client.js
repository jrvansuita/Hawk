module.exports = class Client extends DataAccess {

  constructor(id, code, name, tradeName, socialCode, type, city, state, phone, cell, email, gender, bornDate, lastSale, lastUpdate) {
    super();

    this.id = Num.def(id);
    this.code = Num.def(code);
    this.name = Str.def(name);
    this.tradeName = Str.def(tradeName);
    this.socialCode = Str.def(socialCode);
    this.type = Str.def(type);
    this.city = Str.def(city);
    this.state = Str.def(state);
    this.phone = Str.def(phone);
    this.cell = Str.def(cell);
    this.email = Str.def(email);
    this.gender = Str.def(gender);
    this.bornDate = Dat.def(bornDate);
    this.lastSale = Dat.def(lastSale);
    this.lastUpdate = Dat.def(lastUpdate);
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
      c.tipo,
      c.cidade,
      c.uf,
      c.fone,
      c.celular,
      c.email,
      c.sexo,
      c.dataNascimento,
      c.dataUltimaCompra,
      c.dataAlteracao
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
