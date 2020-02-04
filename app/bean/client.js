module.exports = class Client extends DataAccess {

  constructor(id, code, name, tradeName, cpnj, ie, type,  address, num, district, city, state, zipcode, phone, cell, email, bornDate) {
    super();

    this.id = Num.def(id);
    this.code = Num.def(code);
    this.name = Str.def(name);
    this.tradeName = Str.def(tradeName);
    this.cpnj = Str.def(cpnj);
    this.ie = Str.def(ie);
    this.type = Str.def(type);
    this.address = Str.def(address);
    this.num = Str.def(num);
    this.district = Str.def(district);
    this.city = Str.def(city);
    this.state = Str.def(state);
    this.zipcode = Str.def(zipcode);
    this.phone = Str.def(phone);
    this.cell = Str.def(cell);
    this.email = Str.def(email);
    this.bornDate = Dat.def(bornDate);
  }


  static getKey() {
    return ['id'];
  }


}
