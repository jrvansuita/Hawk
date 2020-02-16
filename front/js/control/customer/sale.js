$(document).ready(() => {

  loadCompletSaleData((data) => {
    bindSaleInfoViewer(data);
  });
});


function loadCompletSaleData(callback){
  _get('/customer-service/sale', {saleNumber : saleNumber}, (data) => {
    window.data = data;
    callback(data);
  })
}

function bindSaleInfoViewer(data){
  $('.loading-sale-modal').hide();
  $('.sale-number').text(data.erp.numeroDaOrdemDeCompra);
  $('.sale-ecco').text(data.erp.numeroPedido);
  $('.sale-nfe').text(data.erp.numeroNotaFiscal || '########');
  $('.status').text(data.store.status);
  $('.sale-situation').text(Util.getSaleSituationName(parseInt(data.erp.situacao)));
  $('.sale-step').text(Util.getSaleStatusName(data.erp.pickingRealizado));
  $('.sale-date').text(Dat.formatwTime(Dat.rollHour(new Date(data.store.created_at),-3)));
}
