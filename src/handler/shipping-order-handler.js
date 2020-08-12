const EccosysStorer = require('../eccosys/eccosys-storer.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const MagentoCalls = require('../magento/magento-calls.js');
const History = require('../bean/history.js');
const SaleLoader = require('../loader/sale-loader.js');

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

  updateMagentoSale(data, msg, callback) {
    var saleNumber = data.numeroDaOrdemDeCompra.split('-')[0];

    if (!this.magentoCalls) {
      this.magentoCalls = new MagentoCalls();
    }

    var body = {
      orderIncrementId: saleNumber,
      status: 'ip_shipped',
      comment: msg,
      notify: true,
    };

    this.magentoCalls
      .sale(saleNumber)
      .then((sale) => {
        if (Arr.isIn(['separation', 'complete', 'processing'], sale.status)) {
          this.magentoCalls.salesOrderUpdate(body);
        } else {
          History.info(this.user, this.historyTitle, Const.sale_status_not_updated_collected_only_magento.format(saleNumber, sale.status), this.historyTag);
        }

        callback();
      })
      .catch((e) => {
        History.error(e, this.historyTitle, JSON.stringify(data), this.user);

        callback();
      });
  }

  updateEccoSale(data, msg, callback) {
    new SaleLoader(data.numeroPedido).setOnError(callback).run((sale) => {
      var body = {
        situacaoSecundaria: 8, // Despachado
        numeroPedido: data.numeroPedido,
        pedidoColetado: true,
      };

      if (sale.situacao === '1' && sale.situacaoSecundaria !== '8') {
        if (sale.deliveryTime) {
          var addDays = sale.deliveryTime + Math.trunc(sale.deliveryTime / 7) * 2;
          body.dataEntrega = Dat.rollDay(null, addDays);
        }

        new EccosysStorer()
          .sale()
          .update([body])
          .go(() => {
            callback();
            History.notify(this.user, this.historyTitle, msg, this.historyTag);
          });
      } else {
        callback();
      }
    });
  }

  updateEachSale(data, callback) {
    var msg = '[Hawk]: ' + Const.sale_collected.format(data.numeroDaOrdemDeCompra);

    this.updateEccoSale(data, msg, () => {
      this.updateMagentoSale(data, msg, callback);
    });
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
