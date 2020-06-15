const SaleGroups = require('../loader/sales-groups.js')

module.exports = {

  get () {
    return SaleGroups.get()
  }

}
