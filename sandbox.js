const Initilizer = require('./src/_init/initializer.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    const SaleKeeper = require('./src/loader/sale-keeper.js');

    new SaleKeeper('938526').requestClient().save((sale) => {});
  });

// const SaleStatusHandler = require('./src/handler/sale-status-handler.js');

// new SaleStatusHandler('933028')
//   .history('Teste', 'Atualizando')
//   .status()
//   .as()
//   .shipped()

//   .situation()
//   .as()
//   .open()

//   // .setUser(this.user)
//   .setOnNeedErpUpdate((sale) => {
//     return sale.situacao === '1' && sale.situacaoSecundaria !== '8';
//   })
//   .body((sale) => {
//     return {
//       situacaoSecundaria: 8, // Despachado
//       pedidoColetado: true,
//       dataPrevista: sale.deliveryTime ? Dat.rollDay(null, sale.deliveryTime + Math.trunc(sale.deliveryTime / 7) * 2) : null,
//     };
//   })
//   .setHistoryMessage((sale) => {
//     return Const.sale_collected.format(sale.numeroPedido);
//   })
//   .setCommentMessage((sale) => {
//     return Const.sale_collected.format(sale.numeroDaOrdemDeCompra);
//   })
//   .setOnNeedStoreUpdate((storeSale) => {
//     return Arr.isIn(['separation', 'complete', 'processing'], storeSale.status);
//   })
//   .run();
