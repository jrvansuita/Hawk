class SaleStatusDialog {
  constructor (status) {
    this.status = status

    this.dialog = new SelectorDialog('Alterar Status do Pedido')
    this.dialog.onButton('Cancelar')
    this._addOptions()
  }

  onItemSelect (callback) {
    this.dialog.onSelect((item) => {
      callback(item)
    })
    return this
  }

  show () {
    this.dialog.show()
  }

  _addOptions () {
    this.dialog.addItem('/img/checked.png', 'Pagamento Confirmado', 'processing')
    this.dialog.addItem('/img/hold-box.png', 'Entregue', 'ip_delivered')
    this.dialog.addItem('/img/truck.png', 'Em Trânsito', 'ip_in_transit')
    this.dialog.addItem('/img/block.png', 'Cancelado', 'canceled')
    this.dialog.addItem('/img/block.png', 'Reprovado/Expirado', 'canceled')
    this.dialog.addItem('/img/blocked.png', 'Segurar/Bloquear', 'holded')
  }
}

class SaleStatusObsDialog extends InputDialog {
  make (callback) {
    this.checkEmptyInputSubmit(true)
      .onNegativeButton('Cancelar', () => {})
      .onPositiveButton('Alterar', (text) => {
        callback(text)
      }).show()
  }
}
