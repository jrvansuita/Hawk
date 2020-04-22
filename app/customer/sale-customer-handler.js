const MagentoCalls = require('../magento/magento-calls.js');
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const History = require('../bean/history.js');


module.exports = class SaleCustomerHandler {

  updateSaleStatus(body, callback){
    new EccosysProvider().sale(body.sale).go((sale) => {

      this.saleObs = sale.observacaoInterna;

      this.updateSaleEccosys(body, () => {
        this.updateSaleMagento(body, (data) => {
          if(data){
            History.notify(body.user.id, 'Status do Pedido', 'O status do pedido {0} foi alterado para {1}'.format(body.sale, Util.getSaleStatusInfo(body.status)), 'Informação');
          }

          callback(data);
        });
      });

    });
  }

  updateSaleMagento(body, callback){
    new MagentoCalls().salesOrderUpdate({
      orderIncrementId: body.sale,
      status:           body.status,
      comment:          Const.sale_status_update_obs.format(body.obs, Util.getSaleStatusInfo(body.status), body.user.name),
      notify:           false
    }).then(callback);
  }

  updateSaleEccosys(body, callback){
    var body = {
      situacao: this._getEccosysSituation(body.status),
      numeroDaOrdemDeCompra: body.sale,
      observacaoInterna: this.saleObs + '\n' + Const.sale_status_update_obs.format(body.obs, Util.getSaleStatusInfo(body.status), body.user.name)
    };

    new EccosysStorer().sale().update([body]).go(() => {
      callback();
    });
  }

  _getEccosysSituation(status){
    switch(status){
      case 'processing': return 0;
      case 'payment_pending': return -1;
      case 'holded': return 2;
      case 'canceled': return 2;
    }
  }
}
