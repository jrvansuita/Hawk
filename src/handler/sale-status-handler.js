/* eslint-disable standard/no-callback-literal */
const EccosysStorer = require('../eccosys/eccosys-storer.js');
const MagentoCalls = require('../magento/magento-calls.js');
const History = require('../bean/history.js');
const SaleLoader = require('../loader/sale-loader.js');

module.exports = class SaleStatusHandler {
  constructor(sale, log) {
    this.storer = new EccosysStorer(log);
    this.prefix = '[HAWK]: ';
    this.setSale(sale).body({}).history('Status', 'Atualização de Status', 'Mensagem não fornecida.');

    this.onError = (e) => {
      History.error(e, this.historyTitle, JSON.stringify(this.sale), this.user);
    };
  }

  setOnError(onError) {
    this.onError = onError;
    return this;
  }

  setUser(user) {
    this.user = user;
    return this;
  }

  setSale(sale) {
    this.sale = sale;
    return this;
  }

  situation() {
    var holder = this;
    return {
      as: () => {
        return {
          /**
           *  Aguardando pagamento
           */
          waitingPayment() {
            return holder.setSituation('-1');
          },

          /**
           *  Em aberto
           */
          open() {
            return holder.setSituation('0');
          },

          /**
           *  Atendido
           */
          done() {
            return holder.setSituation('1');
          },

          /**
           *  Cancelado
           */
          canceled() {
            return holder.setSituation('2');
          },

          /**
           *  Pronto para picking
           */
          pickingReady() {
            return holder.setSituation('3');
          },

          /**
           *  Pagamento em análise
           */
          paymentAnalysis() {
            return holder.setSituation('4');
          },

          /**
           *  Entregue
           */
          delivered() {
            return holder.setSituation('D');
          },
        };
      },
    };
  }

  setSituation(newSituation) {
    this.newSituation = newSituation;
    return this;
  }

  status(notify = true) {
    var holder = this;
    this.statusNotify = notify;
    return {
      as: () => {
        return {
          /**
           *  Pagamento Confirmado
           */
          processing() {
            return holder.setStatus('processing');
          },

          /**
           *  Em Separação
           */
          separation() {
            return holder.setStatus('separation');
          },

          /**
           *  Pagamento Pendente
           */
          pendingPayment() {
            return holder.setStatus('pending_payment');
          },

          /**
           *  Bloqueado na Expedicao
           */
          block() {
            return holder.setStatus('holded');
          },

          /**
           *  Conferência do(s) produto(s) e NF-e
           */
          nfe() {
            return holder.setStatus('complete');
          },

          /**
           *  Entregue
           */
          delivered() {
            return holder.setStatus('ip_delivered');
          },

          /**
           *  Entrega Falhou
           */
          deliveryFailed() {
            return holder.setStatus('ip_delivery_failed');
          },

          /**
           *  Atraso na entrega
           */
          late() {
            return holder.setStatus('ip_delivery_late');
          },

          /**
           *  Em trânsito
           */
          inTransit() {
            return holder.setStatus('ip_in_transit');
          },

          /**
           *  Despachado
           */
          shipped() {
            return holder.setStatus('ip_shipped');
          },

          /**
           *  Reprovado ou Expirado
           */
          canceled() {
            return holder.setStatus('closed');
          },
        };
      },
    };
  }

  setStatus(newStatus) {
    this.newStatus = newStatus;
    return this;
  }

  body(bodyData) {
    this.bodyData = bodyData;
    return this;
  }

  history(tag, title, msg) {
    this.historyTitle = title;
    this.historyTag = tag;
    this.historyMsg = msg;
    return this;
  }

  setObsMessage(message) {
    this.obsMessage = message;
    return this;
  }

  setCommentMessage(message) {
    this.commentMessage = message;
    return this;
  }

  setHistoryMessage(message) {
    this.historyMsg = message;
    return this;
  }

  setNfeJustification(message) {
    this.nfeJustification = message;
    return this;
  }

  setOnNeedErpUpdate(callback) {
    this.onNeedErpUpdate = callback;
    return this;
  }

  _buildBody() {
    var body = typeof this.bodyData === 'function' ? this.bodyData(this.sale) || {} : this.bodyData;

    if (this.newSituation) {
      body.situacao = this.newSituation;
    }

    if (this.obsMessage) {
      body.observacaoInterna = this.sale.observacaoInterna + '\n' + (typeof this.obsMessage === 'function' ? this.obsMessage(this.sale) : this.obsMessage);
    }

    return { ...body, numeroPedido: this.sale.numeroPedido };
  }

  _history() {
    var msg = this.prefix + (typeof this.historyMsg === 'function' ? this.historyMsg(this.sale) : this.historyMsg);
    History.notify(this.user, this.historyTitle, msg, this.historyTag);
  }

  _loadEccoSale(callback) {
    new SaleLoader(this.sale)
      .setOnError(this.onError)
      .loadClient()
      .run((sale) => {
        this.sale = sale;
        this.sale.oc = this.sale.numeroDaOrdemDeCompra.split('-')[0];
        this.sale.nfe = sale.numeroNotaFiscal
        callback(!this.onNeedErpUpdate || (this.onNeedErpUpdate && this.onNeedErpUpdate(this.sale)));
      });
  }

  _updateEccoSale(callback) {
    new EccosysStorer()
      .setOnError(this.onError)
      .sale()
      .update([this._buildBody()])
      .go(() => {
        console.log('[Eccosys] Atualizou o pedido ' + this.sale.numeroPedido);
        callback();
      });
  }

  setOnNeedStoreUpdate(callback) {
    this.onNeedStoreUpdate = callback;
    return this;
  }

  _loadMagentoSale(callback) {
    if (this.onNeedStoreUpdate !== undefined) {
      if (!this.magentoCalls) {
        this.magentoCalls = new MagentoCalls();
      }

      this.magentoCalls
        .sale(this.sale.oc)
        .then((storeSale) => {
          callback(this.onNeedStoreUpdate(storeSale));
        })
        .catch(this.onError);
    } else {
      callback(true);
    }
  }

  _updateMagentoSale(callback) {
    if (this.newStatus) {
      var body = {
        orderIncrementId: this.sale.oc,
        status: this.newStatus,
        comment: this.prefix + (typeof this.commentMessage === 'function' ? this.commentMessage(this.sale) : this.commentMessage),
        notify: this.statusNotify,
      };

      this.magentoCalls.salesOrderUpdate(body);
      console.log('[Magento] Atualizou o status do pedido ' + this.sale.oc + ' para ' + this.newStatus);
    }

    if (callback) callback();
  }

  cancelNfe(user, number, justification, callback) {
    var body = {
      justificativa: this.prefix + justification
    }
    new EccosysStorer().cancelNfe(user, number, body).go((res) => { callback(res) })
  }

  _cancelNfe(response, callback) {
    if (response.error) History.notify(this.user.id, 'Tela do Atendimento', '{0}'.format(response.error[0].erro), 'Falha')
    if (callback) callback(response)
  }

  run(callback) {
    this._loadEccoSale((needUpdate) => {
      if (needUpdate) {
        this._updateEccoSale(() => {
          this._history();
        });
      }

      this._loadMagentoSale((needUpdate) => {
        if (needUpdate) {
          this._updateMagentoSale();
        }
      });

      if (this.sale.nfe) {
        this.cancelNfe(this.user, this.sale.nfe, this.nfeJustification, (nfeResponse) => {
          this._cancelNfe(nfeResponse, callback)
        })
      } else {
        if (callback) callback(this.sale);
      }
    });
  }
};
