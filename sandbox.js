const Initilizer = require('./src/_init/initializer.js');
const Dat = require('./src/util/date.js');
const Num = require('./src/util/number.js');

new Initilizer()
  .setSandboxMode(true)
  .begin()
  .then(async () => {
    // const SaleKeeper = require('./src/loader/sale-keeper.js');
    // const SaleStock = require('./src/bean/sale-stock.js');
    // SaleStock.find(
    //   {
    //     date: {
    //       $gte: Dat.yesterday().begin(),
    //       $lte: Dat.today().end(),
    //     },
    //   },
    //   (_err, doc) => {
    //     doc.forEach((each) => {
    //       // if (each.manufacturer.includes('Sapek')) {
    //       console.log('------------------------------');
    //       var markup = Floa.abs(each.total / each.cost, 2);
    //       console.log('[' + each.sku + '] Venda: ' + Num.money(each.total) + ' | Custo: ' + Num.money(each.cost) + ' = ' + markup);
    //       if (Num.def(markup) > 3) {
    //         // SaleStock.find({ sku: each.sku, date: each.date }, (_err, doc) => {
    //         //   console.log(doc);
    //         // });
    //         SaleStock.upsert({ sku: each.sku, date: each.date }, { cost: each.cost * each.quantity });
    //       }
    //       // }
    //     });
    //     // console.log(doc);
    // new SaleKeeper('942830').requestClient().save((sale) => {});
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
