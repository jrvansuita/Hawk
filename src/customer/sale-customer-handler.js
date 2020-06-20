const MagentoCalls = require('../magento/magento-calls.js')
const EccosysStorer = require('../eccosys/eccosys-storer.js')
const History = require('../bean/history.js')
const Enum = require('../bean/enumerator.js')
const SaleLoader = require('../loader/sale-loader.js')

module.exports = class SaleCustomerHandler {
  updateSaleStatus (body, callback) {
    new SaleLoader(body.sale).run(async (sale) => {
      this.saleObs = sale.observacaoInterna
      this.comment = Const.sale_status_update_obs.format(body.obs, body.sale, (await Enum.on('SALE-STATUS').hunt(body.status, 'value'))?.name, body.user.name)

      this.updateSaleEccosys(body, () => {
        if (sale.numeroNotaFiscal) {
          this.cancelNfe(body.obs, sale.numeroNotaFiscal, (result) => {
            result.sucess ? this._updateSaleMagento(body, (result) => {}) : History.notify(body.user.id, 'Status do Pedido', '{0}'.format(result.error[0].erro), 'Falha')
            callback(result)
          })
        } else {
          this._updateSaleMagento(body, (res) => {
            callback(res)
          })
        }
      })
    })
  }

  cancelNfe (obs, numberNfe, callback) {
    var body = {
      justificativa: '[Hawk - Atendimento] - ' + obs
    }
    new EccosysStorer().cancelNfe(body.user, numberNfe, body).go((res) => { callback(res) })
  }

  _updateSaleMagento (body, callback) {
    this.updateSaleMagento(body, (data) => {
      if (data) {
        History.notify(body.user.id, 'Status do Pedido', this.comment, 'Informação')
      }
      callback(data)
    })
  }

  updateSaleMagento (body, callback) {
    new MagentoCalls().salesOrderUpdate({
      orderIncrementId: body.sale,
      status: body.status,
      comment: this.comment,
      notify: false
    }).then(callback)
  }

  updateSaleEccosys (body, callback) {
    new EccosysStorer().sale().update({
      situacao: this._getEccosysSituation(body.status),
      numeroDaOrdemDeCompra: body.sale,
      observacaoInterna: this.saleObs + '\n' + this.comment
    }).go(() => {
      callback()
    })
  }

  _getEccosysSituation (status) {
    switch (status) {
      case 'processing': return 0
      case 'payment_pending': return -1
      case 'holded': return 2
      case 'canceled': return 2
    }
  }
}
