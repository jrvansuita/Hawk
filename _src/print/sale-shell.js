module.exports = class SaleShell {
  constructor (sale, user) {
    this.number = sale.numeroPedido
    this.obs = sale.observacaoInterna
    this.date = sale.data
    this.oc = sale.numeroDaOrdemDeCompra
    this.clientName = sale.client.nome
    this.transport = sale.transportador
    this.itemsQuantity = sale.itemsQuantity
    this.status = sale.situacao
    this.items = []

    this.setUser(user)
  }

  setUser (user) {
    if (user) {
      this.userName = user.name
    }

    return this
  }

  addItem (item, local) {
    this.items.push(new SaleShellItem(item, local))
  }

  parseItems (sale, products) {
    for (var i = 0; i < sale.items.length; i++) {
      var item = sale.items[i]

      var product = products.find((j) => {
        return j.codigo === item.codigo
      })

      this.addItem(item, product ? product.localizacao : 'Não encontrado')
    }

    return this
  }

  sortByLocal () {
    this.items.sort(sortByLocal)
  }
}

class SaleShellItem {
  constructor (item, local) {
    this.sku = item.codigo
    this.ean = item.gtin
    this.qtd = parseInt(item.quantidade)
    this.local = local.toUpperCase()
  }
}

function sortByLocal (itemA, itemB) {
  try {
    var localA = itemA.local.split('-')[0]
    var localB = itemB.local.split('-')[0]

    var hallA = Num.extract(localA.split('.')[0])
    var hallB = Num.extract(localB.split('.')[0])

    // Se o corredor é o mesmo, compara a coluna para desempatar...
    if (hallA === hallB) {
      var colA = Num.extract(localA.split('.')[1])
      var colB = Num.extract(localB.split('.')[1])

      return colA - colB
    } else {
      return hallA - hallB
    }
  } catch (e) {
    return -1
  }

  // if ( a is less than b by some ordering criterion) {
  //    return -1;
  // }
  //  if (a is greater than b by the ordering criterion) {
  //  return 1;
  // }
  // a must be equal to b
  // return 0;
}
