const Enum = require('../bean/enumerator.js')
const SaleStatusHandler = require('../handler/sale-status-handler.js')

module.exports = class SaleCustomerHandler {
  constructor() {
    this.historyTag = 'Atendimento';
    this.historyTitle = 'Tela do Atendimento';
  }

  async updateSaleStatus(body, callback) {
    var obs = Const.sale_status_update_obs.format(body.obs, body.sale, (await Enum.on('SALE-STATUS').hunt(body.status, 'value'))?.name, body.user.name)

    new SaleStatusHandler(body.sale, true)
      .history(this.historyTag, this.historyTitle, obs)
      .setUser(body.user)
      .setSituation(this._getEccosysSituation(body.status))
      .setStatus(body.status)
      .setObsMessage(obs)
      .setCommentMessage(obs)
      .setNfeJustification(body.obs)
      .setOnNeedStoreUpdate((storeSale) => {
        return body.status !== storeSale.status;
      })
    .run(callback)
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
