
global.selectedFilters = undefined

module.exports = {

  select (selected) {
    if (selected) {
      global.selectedFilters = Object.keys(getFiltersObject()).filter(key => { return selected.includes(key) })
    } else if (!global.selectedFilters) {
      global.selectedFilters = getDefault()
    }
  },

  getSelecteds () {
    return global.selectedFilters
  },

  assert (saleList) {
    if (global.selectedFilters && (saleList.length > 0)) {
      saleList = firstPurchaseFilter(saleList)
      saleList = paymentFilter(saleList)
    }

    return saleList
  },

  getObject () {
    return getFiltersObject()
  }

}

function getDefault () {
  return ['creditCard', 'boleto']
}

function getFiltersObject () {
  return {
    firstPurchase: 'Primeira Compra',
    creditCard: 'Cartão de Crédito',
    boleto: 'Boleto'
  }
}

function firstPurchaseFilter (list) {
  if (global.selectedFilters.includes('firstPurchase')) {
    list = list.filter(sale => {
      return sale.primeiraCompra == '1'
    })
  }

  return list
}

function paymentFilter (list) {
  if (!global.selectedFilters.includes('creditCard')) {
    list = list.filter(sale => {
      return sale.paymentType !== 'creditcard'
    })
  }

  if (!global.selectedFilters.includes('boleto')) {
    list = list.filter(sale => {
      return sale.paymentType !== 'boleto'
    })
  }

  return list
}
