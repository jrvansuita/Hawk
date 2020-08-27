const UserType = require('./enums/user-type')

/* eslint-disable no-undef */
module.exports = class User extends DataAccess {
  constructor(id, name, title, avatar, access, pass, isFull, isActive, token, isLeader, type, office, manufacturer, email) {
    super()
    this.id = Num.def(id, 0) || Util.id()
    this.name = Str.def(name, 'Desconhecido')
    this.title = Str.def(title)
    this.full = !!isFull
    this.access = Str.def(access)
    this.pass = Str.def(pass)
    this.avatar = Str.def(avatar)
    this.active = !!(isActive || !id)
    this.leader = !!isLeader
    this.token = Str.def(token)
    this.setts = {}
    this.menus = []
    this.email = Str.def(email)
    this.type = Num.def(type, UserType.EMPLOYEE) // UserType.EMPLOYEE
    this.office = Str.def(office)
    this.manufacturer = Str.def(manufacturer) // Guarda o nome do fornecedor associado
    this.brands = []
  }

  static getKey() {
    return ['id']
  }

  static suppress(user) {
    if (user) {
      return Util.removeAttrs(user, ['name', 'id', 'avatar', 'full', 'access', 'leader', 'email'])
    }

    return {}
  }

  static updateAvatar(userId, link, callback) {
    User.upsert({ id: userId }, { avatar: link }, (_err, user) => {
      callback(user)
    })
  }
}
