const EccosysStorer = require('../eccosys/eccosys-storer.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const SaleStatusHandler = require('../handler/sale-status-handler.js');

module.exports = class ShippingOrderHandler {
  constructor(user, log) {
    this.user = user;
    this.storer = new EccosysStorer(log);
    this.historyTitle = 'Ordem de Coleta';
    this.historyTag = 'Coleta';
  }

  setId(id) {
    this.id = id;
    return this;
  }

  setNfs(nfs) {
    this.nfs = nfs;
    return this;
  }

  create(body, callback) {
    this.storer
      .shippingOrder(this.user)
      .insert(body)
      .go((data) => {
        var id = Num.extract(data);

        callback(id);
      });
  }

  save(callback) {
    this.storer.shippingOrder(this.user).update(this.id, this.nfs).go(callback);
  }

  collected(callback) {
    this.storer
      .shippingOrder(this.user)
      .collected(this.id)
      .go((data) => {
        callback(data);
        this.updateSaleStatus({ id: this.id });
      });
  }

  updateEachSale(data, next) {
    new SaleStatusHandler(data.numeroPedido)
      .history(this.historyTag, this.historyTitle)
      .status()
      .as()
      .shipped()
      .setUser(this.user)
      .setOnNeedErpUpdate((sale) => {
        return sale.situacao === '1' && sale.situacaoSecundaria !== '8';
      })
      .body((sale) => {
        return {
          situacaoSecundaria: 8, // Despachado
          pedidoColetado: true,
          dataPrevista: sale.deliveryTime ? Dat.rollDay(null, sale.deliveryTime + Math.trunc(sale.deliveryTime / 7) * 2) : null,
        };
      })
      .setHistoryMessage((sale) => {
        return Const.sale_collected.format(sale.numeroPedido);
      })
      .setCommentMessage((sale) => {
        return Const.sale_collected.format(sale.numeroDaOrdemDeCompra);
      })
      .setOnNeedStoreUpdate((storeSale) => {
        return Arr.isIn(['separation', 'complete', 'processing'], storeSale.status);
      })
      .run(next);
  }

  updateSaleStatus(query, onTerminate) {
    new EccosysProvider().shippingOrder(query).go((data) => {
      var nfs = data._NotasFiscais;

      if (nfs.length) {
        var runner = (index) => {
          if (nfs[index]) {
            this.updateEachSale(nfs[index], () => {
              runner(++index);
            });
          } else {
            if (onTerminate) onTerminate();
          }
        };

        runner(0);
      } else {
        if (onTerminate) onTerminate();
      }
    });
  }
};
