// All ready picking sales
global.staticDonePicking = []

module.exports = {

  // pickingRealizado = N -> All Sales to pick
  // pickingRealizado = A -> Picking done
  // pickingRealizado = S -> Invoice done
  handle (saleList) {
    // Todas as Sales com picking realizado, vão para o array staticDonePicking
    global.staticDonePicking = saleList.filter(function (i) {
      return i.pickingRealizado != 'N'
    })
  },

  assert (saleNumbers) {
    if (saleNumbers.length > 0) {
      global.staticDonePicking = global.staticDonePicking.filter(function (i) {
        return !saleNumbers.includes(i.numeroPedido)
      })
    }
  },

  put (sale) {
    var index = this.getIndex(sale)
    if (index > -1) {
      global.staticDonePicking[index] = sale
    } else {
      global.staticDonePicking.push(sale)
    }
  },

  get (saleNumber) {
    var l = global.staticDonePicking.filter(function (i) {
      return i.numeroPedido == saleNumber
    })

    return l.length > 0 ? l[0] : undefined
  },

  getIndex (sale) {
    return global.staticDonePicking.findIndex(s => s.numeroPedido == sale.numeroPedido)
  },

  remove (saleNumber) {
    global.staticDonePicking = global.staticDonePicking.filter(function (i) {
      return i.numeroPedido !== saleNumber
    })
  },

  getSaleNumbers () {
    return this.getList().map(a => a.numeroPedido)
  },

  getList () {
    return global.staticDonePicking
  },

  clear () {
    global.staticDonePicking = []
  }

}
