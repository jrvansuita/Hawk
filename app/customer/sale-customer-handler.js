const MagentoCalls = require('../magento/magento-calls.js');


module.exports = class SaleCustomerHandler {
  
    updateSaleMagento(body, callback){
      new MagentoCalls().salesOrderUpdate({
        orderIncrementId: body.sale,
        status:           body.status,
        comment:          Const.sale_magento_status_update.format(body.userName),
        notify:           false
      }).then(callback);
    }
}
