global.ufList = {}

global.selectedUfs = undefined

module.exports = {

  select (selected) {
    if (selected) {
      if (selected.includes('all')) {
        global.selectedUfs = undefined
      } else {
        global.selectedUfs = selected.includes('|') ? selected.split('|') : [selected]
      }
    }
  },

  getSelecteds () {
    return global.selectedUfs
  },

  assert (saleList) {
    if (global.selectedUfs && (global.selectedUfs.length > 0)) {
      if (saleList.length > 0) {
        saleList = saleList.filter(sale => {
          return global.selectedUfs.join(' ').includes(sale.client ? sale.client.uf : 'none')
        })
      }
    }

    return saleList
  },

  put (name) {
    global.ufList[name] = name
    return name
  },

  getObject () {
    return global.ufList
  }

}
